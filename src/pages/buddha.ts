import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import * as tailwind from "bundle-text:../styles.css";
import { registerDarkMode, unregisterDarkMode } from "../dark-mode.js";
import sw from "url:../assets/sw.jpg";

@customElement("page-buddha")
export class PageBuddha extends LitElement {
    static styles = [
        unsafeCSS(tailwind),
        css`
            :host {
                display: block;
            }
        `
    ];

    connectedCallback() {
        super.connectedCallback();
        registerDarkMode(this);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        unregisterDarkMode(this);
    }

    private toggleChrome() {
        this.dispatchEvent(
            new CustomEvent("toggle-chrome", {
                bubbles: true,
                composed: true
            })
        );
    }

    render() {
        return html`
            <img
                src="${sw}"
                @click=${this.toggleChrome}
                class="fixed inset-0 w-screen h-screen object-cover cursor-pointer" />
        `;
    }
}
