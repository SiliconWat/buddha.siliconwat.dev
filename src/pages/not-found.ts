import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import * as tailwind from "bundle-text:../styles.css";
import { registerDarkMode, unregisterDarkMode } from "../dark-mode.js";
import { registerI18n, unregisterI18n, t } from "../i18n.js";

@customElement("page-not-found")
export class PageNotFound extends LitElement {
    static styles = [
        unsafeCSS(tailwind),
        css`
            :host {
                display: block;
                text-align: center;
            }
        `
    ];

    connectedCallback() {
        super.connectedCallback();
        registerDarkMode(this);
        registerI18n(this);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        unregisterDarkMode(this);
        unregisterI18n(this);
    }

    render() {
        return html`
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
                ${t("notFound.title")}
            </h1>
            <p class="mt-4 text-gray-600 dark:text-gray-400">
                ${t("notFound.subtitle")}
            </p>
        `;
    }
}
