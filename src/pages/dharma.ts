import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import tailwind from "../styles.css?inline";
import { registerDarkMode, unregisterDarkMode } from "../dark-mode.js";
import { setSeoMeta } from "../seo.js";
const sw = "/assets/sw.mp4";

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
        setSeoMeta({
            title: "Silicon Wat — Dharma (Khmer Tipiṭaka)",
            description:
                "Silicon Wat — the Dharma jewel of the Three Jewels: Khmer Tipiṭaka transcription and scripture alignment, building the Living Tipiṭaka substrate.",
            canonical: "https://siliconwat.dev/",
            ogType: "website"
        });
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
            <h1 class="sr-only">Silicon Wat — Dharma (Khmer Tipiṭaka)</h1>
            <p class="sr-only">
                Silicon Wat — the Dharma jewel of the Three Jewels: Khmer
                Tipiṭaka transcription and scripture alignment, building the
                Living Tipiṭaka substrate.
            </p>
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
