import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import tailwind from "../styles.css?inline";
import { registerDarkMode, unregisterDarkMode } from "../dark-mode.js";

const homeVideo = "/assets/sw.mp4";
const homeCover = "/assets/sw1.jpg";

@customElement("page-home")
export class PageHome extends LitElement {
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
            <div
                @click=${this.toggleChrome}
                class="fixed inset-0 cursor-pointer bg-black">
                <video
                    class="w-full h-full object-cover"
                    src="${homeVideo}"
                    poster="${homeCover}"
                    autoplay
                    muted
                    loop
                    playsinline></video>
            </div>
        `;
    }
}
