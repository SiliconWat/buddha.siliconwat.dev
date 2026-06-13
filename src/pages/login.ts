import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import tailwind from "../styles.css?inline";
import { registerDarkMode, unregisterDarkMode } from "../dark-mode.js";
import { setSeoMeta } from "../seo.js";
import { auth } from "../firebase.js";
import {
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    EmailAuthProvider,
    linkWithCredential
} from "firebase/auth";

@customElement("page-login")
export class PageLogin extends LitElement {
    static styles = [
        unsafeCSS(tailwind),
        css`
            :host {
                display: block;
            }
        `
    ];

    @state() private email = "";
    @state() private status:
        | "idle"
        | "sending"
        | "sent"
        | "completing"
        | "success"
        | "error" = "idle";
    @state() private message = "";

    connectedCallback() {
        super.connectedCallback();
        registerDarkMode(this);
        setSeoMeta({
            title: "Login — Silicon Wat ℠",
            description:
                "Sign in to Silicon Wat ℠ — the Dharma jewel: Khmer Tipiṭaka transcription and scripture alignment. Verified by Proof of Humanity℠.",
            canonical: "https://siliconwat.dev/login",
            ogType: "website"
        });
        this.handleEmailLink();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        unregisterDarkMode(this);
    }

    private async handleEmailLink() {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            this.status = "completing";
            let email = window.localStorage.getItem("emailForSignIn");
            if (!email) {
                email =
                    window.prompt(
                        "Please provide your email for confirmation"
                    ) ?? "";
            }
            try {
                await auth.authStateReady();
                const shouldLink =
                    window.localStorage.getItem("linkToAnonymous") === "true";
                if (shouldLink && auth.currentUser?.isAnonymous) {
                    const credential = EmailAuthProvider.credentialWithLink(
                        email,
                        window.location.href
                    );
                    await linkWithCredential(auth.currentUser, credential);
                    await auth.currentUser.reload();
                    await auth.updateCurrentUser(auth.currentUser);
                } else {
                    await signInWithEmailLink(
                        auth,
                        email,
                        window.location.href
                    );
                }
                const linkedEmails = JSON.parse(
                    window.localStorage.getItem("linkedEmails") ?? "[]"
                );
                if (!linkedEmails.includes(email)) {
                    linkedEmails.push(email);
                    window.localStorage.setItem(
                        "linkedEmails",
                        JSON.stringify(linkedEmails)
                    );
                }
                window.localStorage.removeItem("linkToAnonymous");
                window.localStorage.removeItem("emailForSignIn");
                this.status = "success";
                this.message = linkedEmails.includes(email)
                    ? "You have been logged in successfully!"
                    : "Your email has been linked successfully!";

                window.history.pushState({}, "", "/");
                setTimeout(() => {
                    this.dispatchEvent(
                        new CustomEvent("navigate", {
                            detail: "/",
                            bubbles: true,
                            composed: true
                        })
                    );
                }, 2500);
            } catch (error: any) {
                if (error.code === "auth/email-already-in-use") {
                    window.localStorage.setItem(
                        "linkedEmails",
                        JSON.stringify(`[${email}]`)
                    );
                    this.status = "error";
                    this.message = "Sorry, please try one more time.";
                } else {
                    this.status = "error";
                    this.message =
                        error.message ??
                        "Failed to link email. Please try again.";
                }
            }
        }
    }

    private async handleSubmit(e: Event) {
        e.preventDefault();
        if (!this.email) return;

        this.status = "sending";
        const actionCodeSettings = {
            url: window.location.origin + "/login",
            handleCodeInApp: true
        };

        try {
            await sendSignInLinkToEmail(auth, this.email, actionCodeSettings);
            window.localStorage.setItem("emailForSignIn", this.email);
            const linkedEmails = JSON.parse(
                window.localStorage.getItem("linkedEmails") ?? "[]"
            );
            const shouldLink =
                auth.currentUser?.isAnonymous &&
                !linkedEmails.includes(this.email);
            window.localStorage.setItem(
                "linkToAnonymous",
                shouldLink ? "true" : "false"
            );
            this.status = "sent";
            this.message = `A sign-in link has been sent to ${this.email}. Check your inbox or spam folder!`;
        } catch (error: any) {
            this.status = "error";
            this.message =
                error.message ??
                "Failed to send sign-in link. Please try again.";
        }
    }

    render() {
        if (this.status === "completing") {
            return html`
                <section
                    class="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
                    <div
                        class="w-full bg-white rounded-lg shadow dark:border sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
                        <div class="p-6 space-y-4 sm:p-8">
                            <p
                                class="text-center text-gray-500 dark:text-gray-400">
                                Logging you in...
                            </p>
                        </div>
                    </div>
                </section>
            `;
        }

        if (this.status === "success") {
            return html`
                <section
                    class="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
                    <div
                        class="w-full bg-white rounded-lg shadow dark:border sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
                        <div class="p-6 space-y-4 sm:p-8">
                            <div
                                class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900">
                                <svg
                                    class="w-6 h-6 text-green-600 dark:text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <p
                                class="text-center text-green-600 dark:text-green-400 font-medium">
                                ${this.message}
                            </p>
                        </div>
                    </div>
                </section>
            `;
        }

        return html`
            <section
                class="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
                <div
                    class="w-full bg-white rounded-lg shadow dark:border sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
                    <div class="p-6 space-y-4 sm:p-8">
                        <h1
                            class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Silicon Wat ℠ Login
                        </h1>
                        <form class="space-y-4" @submit=${this.handleSubmit}>
                            <label
                                for="hb-email"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >Your Email</label
                            >
                            <div class="relative mb-6">
                                <div
                                    class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                                    <svg
                                        class="w-4 h-4 text-gray-500 dark:text-gray-400"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 16">
                                        <path
                                            d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z" />
                                        <path
                                            d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    id="hb-email"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="thank@siliconwat.dev"
                                    required
                                    .value=${this.email}
                                    @input=${(e: Event) =>
                                        (this.email = (
                                            e.target as HTMLInputElement
                                        ).value)}
                                    ?disabled=${this.status === "sending"} />
                            </div>

                            ${this.status === "sent"
                                ? html`
                                      <div
                                          class="p-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-700 dark:text-green-400"
                                          role="alert">
                                          ${this.message}
                                      </div>
                                  `
                                : ""}
                            ${this.status === "error"
                                ? html`
                                      <div
                                          class="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-700 dark:text-red-400"
                                          role="alert">
                                          ${this.message}
                                      </div>
                                  `
                                : ""}

                            <button
                                type="submit"
                                class="w-full text-white bg-purple-500 hover:bg-purple-600 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-purple-500 dark:hover:bg-purple-600 dark:focus:ring-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                ?disabled=${this.status === "sending"}>
                                ${this.status === "sending"
                                    ? "Sending..."
                                    : "Send Sign-In Link"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
            <p class="text-center text-sm text-gray-500 dark:text-gray-400">
                ❤️ Proof of Humanity by HeartBank®
            </p>
        `;
    }
}
