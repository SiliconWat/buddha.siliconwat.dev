import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import tailwind from "../styles.css?inline";
import { registerI18n, unregisterI18n, t } from "../i18n.js";

// Bottom toast prompting the user to reload when a new app version has been
// installed by the service worker. Shown via showUpdateToast(); the "Refresh"
// action calls the provided callback (vite-plugin-pwa's updateSW(true)).
@customElement("hb-update-toast")
export class HbUpdateToast extends LitElement {
    static styles = [
        unsafeCSS(tailwind),
        css`
            :host {
                position: fixed;
                left: 50%;
                bottom: 1rem;
                transform: translateX(-50%);
                z-index: 9999;
                width: calc(100% - 2rem);
                max-width: 28rem;
            }
        `
    ];

    // Set by showUpdateToast before insertion.
    onRefresh: () => void = () => {};

    connectedCallback() {
        super.connectedCallback();
        registerI18n(this);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        unregisterI18n(this);
    }

    private refresh() {
        this.onRefresh();
    }

    private dismiss() {
        this.remove();
    }

    render() {
        return html`
            <div
                class="flex items-center gap-3 p-4 rounded-lg shadow-lg bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                role="alert">
                <span class="flex-1 text-sm text-gray-900 dark:text-white">
                    ${t("update.available")}
                </span>
                <button
                    type="button"
                    @click=${this.refresh}
                    class="text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:focus:ring-yellow-700">
                    ${t("update.refresh")}
                </button>
                <button
                    type="button"
                    @click=${this.dismiss}
                    aria-label=${t("update.dismiss")}
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none px-1">
                    &times;
                </button>
            </div>
        `;
    }
}

export function showUpdateToast(onRefresh: () => void) {
    if (document.querySelector("hb-update-toast")) return;
    const el = document.createElement("hb-update-toast") as HbUpdateToast;
    el.onRefresh = onRefresh;
    document.body.appendChild(el);
}
