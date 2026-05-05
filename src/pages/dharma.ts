import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import * as tailwind from "bundle-text:../styles.css";
import { registerDarkMode, unregisterDarkMode } from "../dark-mode.js";
import sw from "url:../assets/sw.mp4";

@customElement("page-dharma")
export class PageDharma extends LitElement {
    static styles = [
        unsafeCSS(tailwind),
        css`
            :host {
                display: block;
            }
            video {
                position: fixed;
                inset: 0;
                width: 100vw;
                height: 100vh;
                object-fit: cover;
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
            <video
                src="${sw}"
                autoplay
                loop
                muted
                playsinline
                @click=${this.toggleChrome}></video>
        `;
    }
}
