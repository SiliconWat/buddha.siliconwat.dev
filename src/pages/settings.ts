import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import * as tailwind from "bundle-text:../styles.css";
import { registerDarkMode, unregisterDarkMode } from "../dark-mode.js";
import { registerI18n, unregisterI18n, t } from "../i18n.js";
import { trackEvent } from "../analytics.js";
import { auth, db, messaging } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import swUrl from "url:../firebase-messaging-sw.js";

const VAPID_KEY =
    "BPBFkwm9beWY2ZuMw-LIEg7Bjnx54XMR2hcuq_oBLK03Qow6GpNtoYY59MDP6rHAim1pDlIlY3gtJZhJqqsXut8";

@customElement("page-settings")
export class PageSettings extends LitElement {
    static styles = [
        unsafeCSS(tailwind),
        css`
            :host {
                display: block;
            }
        `
    ];

    @state() private notificationsEnabled = false;
    @state() private supported = true;
    @state() private loading = true;
    @state() private message = "";
    private isStandalone = window.matchMedia("(display-mode: standalone)")
        .matches;

    connectedCallback() {
        super.connectedCallback();
        registerDarkMode(this);
        registerI18n(this);

        onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.history.pushState({}, "", "/");
                this.dispatchEvent(
                    new CustomEvent("navigate", {
                        detail: "/",
                        bubbles: true,
                        composed: true
                    })
                );
                return;
            }
            this.loadSettings(user.uid);
        });
    }

    private navigate(e: Event, path: string) {
        e.preventDefault();
        window.history.pushState({}, "", path);
        this.dispatchEvent(
            new CustomEvent("navigate", {
                detail: path,
                bubbles: true,
                composed: true
            })
        );
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        unregisterDarkMode(this);
        unregisterI18n(this);
    }

    private swRegistration: ServiceWorkerRegistration | null = null;

    private async loadSettings(uid: string) {
        const m = await messaging;
        if (!m) {
            this.supported = false;
            this.loading = false;
            return;
        }

        this.swRegistration = await navigator.serviceWorker.register(swUrl);
        await navigator.serviceWorker.ready;

        const snap = await getDoc(doc(db, "users", uid));
        this.notificationsEnabled = snap.data()?.fcmToken ? true : false;
        this.loading = false;
    }

    private async toggleNotifications() {
        const user = auth.currentUser;
        if (!user) return;

        const m = await messaging;
        if (!m) return;

        this.loading = true;
        this.message = "";

        try {
            if (this.notificationsEnabled) {
                const sub =
                    await this.swRegistration?.pushManager.getSubscription();
                if (sub) await sub.unsubscribe();
                await setDoc(
                    doc(db, "users", user.uid),
                    { fcmToken: null },
                    { merge: true }
                );
                this.notificationsEnabled = false;
                this.message = t("settings.disabled");
                trackEvent("notifications_disabled");
            } else {
                const permission = await Notification.requestPermission();
                if (permission === "denied") {
                    this.message = t("settings.denied");
                    this.loading = false;
                    return;
                }

                const registration = await navigator.serviceWorker.ready;
                const token = await getToken(m, {
                    vapidKey: VAPID_KEY,
                    serviceWorkerRegistration: registration
                });
                await setDoc(
                    doc(db, "users", user.uid),
                    { fcmToken: token },
                    { merge: true }
                );
                this.notificationsEnabled = true;
                this.message = t("settings.enabled");
                trackEvent("notifications_enabled");
                if (!this.isStandalone) {
                    setTimeout(() => {
                        this.message = "";
                    }, 2000);
                }
            }
        } catch (error: any) {
            this.message = error.message;
        }
        this.loading = false;
    }

    render() {
        return html`
            <section
                class="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
                <div
                    class="w-full bg-white rounded-lg shadow dark:border sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
                    <div class="p-6 space-y-6 sm:p-8">
                        <h1
                            class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            ${t("settings.title")}
                        </h1>

                        <div
                            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                            <div>
                                <h3
                                    class="text-base font-medium text-gray-900 dark:text-white">
                                    ${t("settings.notifications")}
                                </h3>
                                <p
                                    class="text-sm text-gray-500 dark:text-gray-400">
                                    ${this.supported
                                        ? t("settings.notificationsDesc")
                                        : t("settings.unsupported")}
                                </p>
                            </div>
                            <button
                                @click=${this.toggleNotifications}
                                ?disabled=${!this.supported || this.loading}
                                class="px-4 py-2 text-sm font-medium rounded-lg ${this
                                    .notificationsEnabled
                                    ? "text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                                    : "text-white bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600"} disabled:opacity-50 disabled:cursor-not-allowed">
                                ${this.loading
                                    ? "..."
                                    : this.notificationsEnabled
                                      ? t("settings.disable")
                                      : t("settings.enable")}
                            </button>
                        </div>

                        ${this.message
                            ? html`
                                  <div
                                      class="p-4 text-sm rounded-lg ${this
                                          .notificationsEnabled
                                          ? "text-green-800 bg-green-50 dark:bg-gray-700 dark:text-green-400"
                                          : "text-gray-800 bg-gray-50 dark:bg-gray-700 dark:text-gray-400"}"
                                      role="alert">
                                      ${this.message}
                                  </div>
                              `
                            : ""}
                        ${this.notificationsEnabled && !this.isStandalone
                            ? html`
                                  <div
                                      class="p-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-700 dark:text-yellow-400"
                                      role="alert">
                                      ${t("settings.installPrompt")}
                                      <a
                                          href="/install"
                                          @click=${(e: Event) =>
                                              this.navigate(e, "/install")}
                                          class="font-medium underline hover:no-underline">
                                          ${t("settings.installLink")}
                                      </a>
                                  </div>
                              `
                            : ""}
                    </div>
                </div>
            </section>
        `;
    }
}
