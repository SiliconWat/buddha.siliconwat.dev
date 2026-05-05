import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import  * as tailwind from "bundle-text:../styles.css";
import { registerDarkMode, unregisterDarkMode } from "../dark-mode.js";
import sw1 from "url:../assets/sw1.jpg";
import sw2 from "url:../assets/sw2.jpg";

@customElement("page-buddha")
export class PageBuddha extends LitElement {
    static styles = [
        unsafeCSS(tailwind),
        css`
            :host {
                display: block;
            }
            img {
                transition: opacity 1.5s ease-in-out;
            }
        `
    ];

    @state() private active = 0;
    private intervalId?: number;

    connectedCallback() {
        super.connectedCallback();
        registerDarkMode(this);
        this.intervalId = window.setInterval(() => {
            this.active = this.active === 0 ? 1 : 0;
        }, 3000);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        unregisterDarkMode(this);
        if (this.intervalId) clearInterval(this.intervalId);
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
                src="${sw1}"
                @click=${this.toggleChrome}
                class="fixed inset-0 w-screen h-screen object-cover cursor-pointer"
                style="opacity: ${this.active === 0 ? 1 : 0}" />
            <img
                src="${sw2}"
                @click=${this.toggleChrome}
                class="fixed inset-0 w-screen h-screen object-cover cursor-pointer"
                style="opacity: ${this.active === 1 ? 1 : 0}" />
        `;
    }
}
