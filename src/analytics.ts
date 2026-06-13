import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function getDeviceId(): string {
    let id = localStorage.getItem("hb-device");
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("hb-device", id);
    }
    return id;
}

const authReady = new Promise<void>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, () => {
        unsubscribe();
        resolve();
    });
});

export async function trackEvent(event: string, data?: Record<string, string>) {
    if (location.hostname === "localhost") return; // comment out to test locally
    await authReady;
    addDoc(collection(db, "events"), {
        event,
        data: data ?? null,
        uid: auth.currentUser?.uid ?? null,
        deviceId: getDeviceId(),
        userAgent: navigator.userAgent,
        location: `${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
        timestamp: serverTimestamp()
    }).catch(() => {});
}

// Normalize any thrown value into string-only fields and log it as an "error"
// event. `source` labels the origin (e.g. "window.onerror", "login.send_code").
// Reuses trackEvent — which already swallows its own write failures — so this
// can never recurse from inside the global handlers below.
export function trackError(
    source: string,
    error: unknown,
    extra?: Record<string, string>
) {
    const err = error as { message?: unknown; code?: unknown; stack?: unknown };
    const data: Record<string, string> = {
        source,
        message: String(err?.message ?? error).slice(0, 300)
    };
    if (err?.code !== undefined) data.code = String(err.code);
    if (err?.stack !== undefined) data.stack = String(err.stack).slice(0, 500);
    if (extra) for (const k in extra) data[k] = String(extra[k]);
    void trackEvent("error", data);
}

let errorTrackingRegistered = false;

// Register window-level handlers once so uncaught errors and unhandled
// promise rejections are tracked. Idempotent — safe to call on every mount.
export function registerErrorTracking() {
    if (errorTrackingRegistered) return;
    errorTrackingRegistered = true;
    window.addEventListener("error", (e) =>
        trackError("window.onerror", e.error ?? e.message, {
            src: String(e.filename ?? "")
        })
    );
    window.addEventListener("unhandledrejection", (e) =>
        trackError("unhandledrejection", e.reason)
    );
}
