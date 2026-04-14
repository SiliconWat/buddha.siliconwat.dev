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
