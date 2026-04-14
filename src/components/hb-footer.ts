import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import * as tailwind from "bundle-text:../styles.css";
import {
    registerDarkMode,
    unregisterDarkMode,
    applyColorScheme
} from "../dark-mode.js";
import { registerI18n, unregisterI18n, t } from "../i18n.js";
import { trackEvent } from "../analytics.js";
import hbLogo from "url:../assets/hb.svg";

@customElement("hb-footer")
export class HbFooter extends LitElement {
    static styles = [
        unsafeCSS(tailwind),
        css`
            :host {
                display: block;
            }
        `
    ];

    @property({ type: Boolean, reflect: true }) open = false;
    @state() private startY = 0;
    @state() private dragging = false;

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

    private navigate(e: Event, path: string) {
        e.preventDefault();
        this.open = false;
        window.history.pushState({}, "", path);
        this.dispatchEvent(
            new CustomEvent("navigate", {
                detail: path,
                bubbles: true,
                composed: true
            })
        );
    }

    private onTouchStart(e: TouchEvent) {
        this.startY = e.touches[0].clientY;
        this.dragging = true;
    }

    private onTouchMove(e: TouchEvent) {
        if (!this.dragging) return;
        const diff = this.startY - e.touches[0].clientY;
        if (diff > 50) {
            this.open = true;
            this.dragging = false;
        } else if (diff < -50) {
            this.open = false;
            this.dragging = false;
        }
    }

    private onTouchEnd() {
        this.dragging = false;
    }

    private toggle() {
        this.open = !this.open;
    }

    private setColorScheme(mode: "dark" | "light" | "auto") {
        if (mode === "dark") {
            localStorage.setItem("color-scheme", "dark");
        } else if (mode === "light") {
            localStorage.setItem("color-scheme", "light");
        } else {
            localStorage.removeItem("color-scheme");
        }
        applyColorScheme();
        this.open = false;
        trackEvent("theme_changed", { mode });
    }

    render() {
        return html`
            <div
                class="fixed inset-0 bg-gray-900/50 z-30 transition-opacity ${this
                    .open
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"}"
                @click=${() => (this.open = false)}></div>
            <div
                class="fixed bottom-0 left-0 right-0 z-40 w-full overflow-hidden transition-transform duration-300 bg-white border-t border-gray-200 rounded-t-lg dark:border-gray-700 dark:bg-gray-800 ${this
                    .open
                    ? "translate-y-0"
                    : "translate-y-full"}"
                style="max-height: 80vh"
                @touchstart=${this.onTouchStart}
                @touchmove=${this.onTouchMove}
                @touchend=${this.onTouchEnd}>
                <div
                    class="p-4 cursor-pointer"
                    @click=${this.toggle}
                    @touchstart=${this.onTouchStart}
                    @touchmove=${this.onTouchMove}
                    @touchend=${this.onTouchEnd}>
                    <span
                        class="absolute w-8 h-1 -translate-x-1/2 bg-gray-300 rounded-lg top-3 left-1/2 dark:bg-gray-600"></span>
                    <h5
                        class="hidden items-center text-base text-gray-500 dark:text-gray-400 font-medium">
                        Footer
                    </h5>
                </div>
                <div class="grid grid-cols-3 gap-4 p-4 lg:grid-cols-3">
                    <a
                        href="/tutorials"
                        @click=${(e: Event) => this.navigate(e, "/tutorials")}
                        class="hidden p-4 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700">
                        <div
                            class="flex justify-center items-center p-2 mx-auto mb-2 bg-gray-200 dark:bg-gray-600 rounded-full w-[48px] h-[48px] max-w-[48px] max-h-[48px]">
                            <svg
                                class="inline w-5 h-5 text-gray-500 dark:text-gray-400"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 512 512">
                                <path
                                    d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9l0 176c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z" />
                            </svg>
                        </div>
                        <div
                            class="font-medium text-center text-gray-500 dark:text-gray-400">
                            ${t("footer.videoTutorials")}
                        </div>
                    </a>
                    <a
                        href="/aquarius"
                        @click=${(e: Event) => this.navigate(e, "/aquarius")}
                        class="hidden p-4 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700">
                        <div
                            class="flex justify-center items-center p-2 mx-auto mb-2 bg-gray-200 dark:bg-gray-600 rounded-full w-[48px] h-[48px] max-w-[48px] max-h-[48px]">
                            <svg
                                class="inline w-5 h-5 text-gray-500 dark:text-gray-400"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 576 512">
                                <path
                                    d="M64 96c53 0 96 43 96 96l0 85.8c29.7-44.7 77.8-76.2 133.4-84 25.6 60 85.2 102.1 154.6 102.1 10.9 0 21.6-1.1 32-3.1L480 480c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-140.8-136 108.8 56 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-144 0c-53 0-96-43-96-96l0-224c0-16.6-12.6-30.2-28.7-31.8l-6.6-.3C44.6 158.2 32 144.6 32 128 32 110.3 46.3 96 64 96zM533.8 3.2C544.2-5.5 560 1.9 560 15.5L560 128c0 61.9-50.1 112-112 112S336 189.9 336 128l0-112.5c0-13.6 15.8-21 26.2-12.3L416 48 480 48 533.8 3.2zM400 108a20 20 0 1 0 0 40 20 20 0 1 0 0-40zm96 0a20 20 0 1 0 0 40 20 20 0 1 0 0-40z" />
                            </svg>
                        </div>
                        <div
                            class="font-medium text-center text-gray-500 dark:text-gray-400">
                            ${t("footer.dearAquarius")}
                        </div>
                    </a>
                    <a
                        href="/install"
                        @click=${(e: Event) => this.navigate(e, "/install")}
                        class="hidden p-4 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700">
                        <div
                            class="flex justify-center items-center p-2 mx-auto mb-2 bg-gray-200 dark:bg-gray-600 rounded-full w-[48px] h-[48px] max-w-[48px] max-h-[48px]">
                            <svg
                                class="inline w-5 h-5 text-gray-500 dark:text-gray-400"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 384 512">
                                <path
                                    d="M16 64C16 28.7 44.7 0 80 0L304 0c35.3 0 64 28.7 64 64l0 384c0 35.3-28.7 64-64 64L80 512c-35.3 0-64-28.7-64-64L16 64zM128 440c0 13.3 10.7 24 24 24l80 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-80 0c-13.3 0-24 10.7-24 24zM304 64l-224 0 0 304 224 0 0-304z" />
                            </svg>
                        </div>
                        <div
                            class="font-medium text-center text-gray-500 dark:text-gray-400">
                            ${t("footer.downloadApp")}
                        </div>
                    </a>
                    <div
                        @click=${() => this.setColorScheme("dark")}
                        class="p-4 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700">
                        <div
                            class="flex justify-center items-center p-2 mx-auto mb-2 bg-gray-200 dark:bg-gray-600 rounded-full w-[48px] h-[48px] max-w-[48px] max-h-[48px]">
                            <svg
                                class="inline w-5 h-5 text-gray-500 dark:text-gray-400"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 384 512">
                                <path
                                    d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z" />
                            </svg>
                        </div>
                        <div
                            class="font-medium text-center text-gray-500 dark:text-gray-400">
                            ${t("footer.darkMode")}
                        </div>
                    </div>
                    <div
                        @click=${() => this.setColorScheme("auto")}
                        class="p-4 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700">
                        <div
                            class="flex justify-center items-center p-2 mx-auto mb-2 bg-gray-200 dark:bg-gray-600 rounded-full w-[48px] h-[48px] max-w-[48px] max-h-[48px]">
                            <svg
                                class="inline w-5 h-5 text-gray-500 dark:text-gray-400"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 512 512">
                                <path
                                    d="M448 256c0-106-86-192-192-192l0 384c106 0 192-86 192-192zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z" />
                            </svg>
                        </div>
                        <div
                            class="font-medium text-center text-gray-500 dark:text-gray-400">
                            ${t("footer.autoMode")}
                        </div>
                    </div>
                    <div
                        @click=${() => this.setColorScheme("light")}
                        class="p-4 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700">
                        <div
                            class="flex justify-center items-center p-2 mx-auto mb-2 bg-gray-200 dark:bg-gray-600 rounded-full w-[48px] h-[48px] max-w-[48px] max-h-[48px]">
                            <svg
                                class="inline w-5 h-5 text-gray-500 dark:text-gray-400"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 512 512">
                                <path
                                    d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z" />
                            </svg>
                        </div>
                        <div
                            class="font-medium text-center text-gray-500 dark:text-gray-400">
                            ${t("footer.lightMode")}
                        </div>
                    </div>
                </div>
            </div>
            <div
                class="fixed bottom-0 left-0 right-0 z-30 cursor-pointer ${this
                    .open
                    ? "hidden"
                    : ""}"
                @click=${this.toggle}
                @touchstart=${this.onTouchStart}
                @touchmove=${this.onTouchMove}
                @touchend=${this.onTouchEnd}>
                <div
                    class="w-full bg-white border-t border-gray-200 rounded-t-lg dark:border-gray-700 dark:bg-gray-800 p-4 h-[70px] flex items-center justify-center">
                    <span
                        class="absolute w-8 h-1 -translate-x-1/2 bg-gray-300 rounded-lg top-3 left-1/2 dark:bg-gray-600"></span>
                    <h5
                        class="mt-3 -mr-3 flex items-center justify-center text-lg text-gray-500 dark:text-gray-400 font-black">
                        Silicon Wat ℠
                    </h5>
                </div>
            </div>
        `;
    }
}
