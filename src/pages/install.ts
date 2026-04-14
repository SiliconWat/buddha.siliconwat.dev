import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import * as tailwind from "bundle-text:../styles.css";
import { registerDarkMode, unregisterDarkMode } from "../dark-mode.js";
import { registerI18n, unregisterI18n, t } from "../i18n.js";
import { trackEvent } from "../analytics.js";

@customElement("page-install")
export class PageInstall extends LitElement {
    static styles = [
        unsafeCSS(tailwind),
        css`
            :host {
                display: block;
            }
        `
    ];

    @state() private installed = false;

    connectedCallback() {
        super.connectedCallback();
        registerDarkMode(this);
        registerI18n(this);

        if (!window.matchMedia("(display-mode: standalone)").matches) {
            window.history.replaceState({}, "", "/tutorials#installApp");
            this.dispatchEvent(
                new CustomEvent("navigate", {
                    detail: "/tutorials",
                    bubbles: true,
                    composed: true
                })
            );
            return;
        }

        this.installed = true;
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        unregisterDarkMode(this);
        unregisterI18n(this);
    }

    render() {
        if (!this.installed) return html``;

        return html`
            <section
                class="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
                <div
                    class="w-full bg-white rounded-lg shadow dark:border sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
                    <div class="p-6 space-y-4 sm:p-8 text-center">
                        <div
                            class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900">
                            <svg
                                class="w-8 h-8 text-green-600 dark:text-green-400"
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
                        <h1
                            class="text-xl font-bold text-gray-900 dark:text-white">
                            ${t("pwa.alreadyInstalled")}
                        </h1>
                        <p class="text-gray-500 dark:text-gray-400">
                            ${t("pwa.alreadyInstalledDesc")}
                        </p>
                    </div>
                </div>
            </section>
        `;
    }
}
