import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import * as tailwind from "bundle-text:../styles.css";
import { registerDarkMode, unregisterDarkMode } from "../dark-mode.js";
import { registerI18n, unregisterI18n, t, getLang } from "../i18n.js";
import { trackEvent } from "../analytics.js";
import { auth } from "../firebase.js";
import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult
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

    @state() private phone = "";
    @state() private countryCode = getLang() === "km" ? "+855" : "+1";
    @state() private code = "";
    @state() private status:
        | "idle"
        | "sending"
        | "sent"
        | "verifying"
        | "success"
        | "error" = "idle";
    @state() private message = "";
    @state() private error = "";

    private confirmationResult: ConfirmationResult | null = null;
    private recaptchaVerifier: RecaptchaVerifier | null = null;

    private recaptchaContainer: HTMLDivElement | null = null;

    connectedCallback() {
        super.connectedCallback();
        registerDarkMode(this);
        registerI18n(this);
        this.setupRecaptcha();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        unregisterDarkMode(this);
        unregisterI18n(this);
        this.recaptchaContainer?.remove();
    }

    private setupRecaptcha() {
        this.recaptchaContainer = document.createElement("div");
        this.recaptchaContainer.id = "recaptcha-container";
        document.body.appendChild(this.recaptchaContainer);
        this.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            this.recaptchaContainer,
            { size: "invisible" }
        );
    }

    private resetToPhone() {
        this.status = "idle";
        this.phone = "";
        this.code = "";
        this.error = "";
        this.confirmationResult = null;
        this.recaptchaContainer?.remove();
        this.setupRecaptcha();
    }

    private async handleSendCode(e: Event) {
        e.preventDefault();
        if (!this.phone) return;

        const fullNumber = this.countryCode + this.phone.replace(/\D/g, "");
        this.status = "sending";
        try {
            this.confirmationResult = await signInWithPhoneNumber(
                auth,
                fullNumber,
                this.recaptchaVerifier!
            );
            this.status = "sent";
            this.message = t("login.codeSent", fullNumber);
            trackEvent("send_code", { phone: fullNumber });
        } catch (error: any) {
            this.status = "error";
            this.message = error.message ?? t("login.sendFailed");
        }
    }

    private async handleVerifyCode(e: Event) {
        e.preventDefault();
        if (!this.code || !this.confirmationResult) return;

        this.status = "verifying";
        try {
            await this.confirmationResult.confirm(this.code);
            this.status = "success";
            this.message = t("login.success");
            trackEvent("login_success");

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
            this.status = "sent";
            trackEvent("login_failed", { error: error.code ?? "unknown" });
            this.error =
                error.code === "auth/invalid-verification-code"
                    ? t("login.invalidCode")
                    : (error.message ?? t("login.loginFailed"));
        }
    }

    private renderContent() {
        if (this.status === "verifying") {
            return html`
                <section
                    class="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
                    <div
                        class="w-full bg-white rounded-lg shadow dark:border sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
                        <div class="p-6 space-y-4 sm:p-8">
                            <p
                                class="text-center text-gray-500 dark:text-gray-400">
                                ${t("login.loggingIn")}
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

        if (this.status === "sent") {
            return html`
                <section
                    class="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
                    <div
                        class="w-full bg-white rounded-lg shadow dark:border sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
                        <div class="p-6 space-y-4 sm:p-8">
                            <h1
                                class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                ${t("login.enterCode")}
                            </h1>
                            <div
                                class="p-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-700 dark:text-green-400"
                                role="alert">
                                ${this.message}
                            </div>
                            <form
                                class="space-y-4"
                                @submit=${this.handleVerifyCode}>
                                <label
                                    for="hb-code"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >${t("login.verificationCode")}</label
                                >
                                <input
                                    type="text"
                                    inputmode="numeric"
                                    pattern="[0-9]{6}"
                                    maxlength="6"
                                    name="code"
                                    id="hb-code"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-2xl tracking-[0.5em] text-center rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="000000"
                                    required
                                    .value=${this.code}
                                    @input=${(e: Event) =>
                                        (this.code = (
                                            e.target as HTMLInputElement
                                        ).value)} />

                                ${this.error
                                    ? html`
                                          <div
                                              class="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-700 dark:text-red-400"
                                              role="alert">
                                              ${this.error}
                                          </div>
                                      `
                                    : ""}

                                <button
                                    type="submit"
                                    class="w-full text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:focus:ring-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    ?disabled=${this.code.length !== 6}>
                                    ${t("login.verify")}
                                </button>
                            </form>
                            <button
                                type="button"
                                @click=${this.resetToPhone}
                                class="w-full text-sm text-blue-600 hover:underline dark:text-blue-400 mt-2 text-center">
                                ${t("login.differentPhone")}
                            </button>
                        </div>
                    </div>
                </section>
                <p class="text-center text-sm text-gray-500 dark:text-gray-400">
                    ${t("login.footer")}
                </p>
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
                            ${t("login.title")}
                        </h1>
                        <form class="space-y-4" @submit=${this.handleSendCode}>
                            <label
                                for="hb-phone"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >${t("login.yourPhone")}</label
                            >
                            <div class="flex mb-6">
                                <select
                                    class="outline-none bg-gray-50 border border-gray-300 border-e-0 text-gray-900 text-base rounded-s-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    .value=${this.countryCode}
                                    @change=${(e: Event) =>
                                        (this.countryCode = (
                                            e.target as HTMLSelectElement
                                        ).value)}
                                    ?disabled=${this.status === "sending"}>
                                    <option value="+855">🇰🇭 +855</option>
                                    <option value="+1">🇺🇸 +1</option>
                                </select>
                                <input
                                    type="tel"
                                    name="phone"
                                    id="hb-phone"
                                    class="bg-gray-50 outline-none border border-gray-300 text-gray-900 text-base rounded-e-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder=${this.countryCode === "+855"
                                        ? "12 345 678"
                                        : "(800) 59-THANK"}
                                    required
                                    .value=${this.phone}
                                    @input=${(e: Event) => {
                                        const input =
                                            e.target as HTMLInputElement;
                                        this.phone = input.value.replace(
                                            /\D/g,
                                            ""
                                        );
                                        input.value = this.phone;
                                    }}
                                    ?disabled=${this.status === "sending"} />
                            </div>

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
                                class="w-full text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:focus:ring-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                ?disabled=${this.status === "sending"}>
                                ${this.status === "sending"
                                    ? t("login.sending")
                                    : t("login.sendCode")}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
            <p class="text-center text-sm text-gray-500 dark:text-gray-400">
                ${t("login.footer")}
            </p>
        `;
    }

    render() {
        return html` ${this.renderContent()} `;
    }
}
