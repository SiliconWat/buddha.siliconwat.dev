import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import * as tailwind from "bundle-text:../styles.css";
import "./hb-menu.js";
import { registerDarkMode, unregisterDarkMode } from "../dark-mode.js";
import { registerI18n, unregisterI18n, t, getLang, setLang } from "../i18n.js";
import { trackEvent } from "../analytics.js";
import { auth } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";

@customElement("hb-header")
export class HbHeader extends LitElement {
    static styles = [
        unsafeCSS(tailwind),
        css`
            :host {
                display: block;
            }
        `
    ];

    @state() private signedIn = false;
    @state() private langOpen = false;

    connectedCallback() {
        super.connectedCallback();
        registerDarkMode(this);
        registerI18n(this);

        onAuthStateChanged(auth, (user) => {
            this.signedIn = !!user;
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        unregisterDarkMode(this);
        unregisterI18n(this);
    }

    private navigate(e: Event, path: string) {
        e.preventDefault();
        window.history.pushState({}, "", path);
        this.dispatchEvent(
            new CustomEvent("navigate", {
                detail: path,
                bubbles: true,
                composed: true
            })
        );
    }

    render() {
        return html`
            <nav
                class="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
                <div
                    class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <aside
                        class="flex items-center space-x-3 rtl:space-x-reverse">
                        <button
                            @click=${this.toggleMenu}
                            type="button"
                            class="inline-flex items-center p-2 w-10 h-8 justify-center text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                            aria-expanded="false">
                            <span class="sr-only">${t("header.openMenu")}</span>
                            <svg
                                class="w-5 h-5"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 17 14">
                                <path
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M1 1h15M1 7h15M1 13h15" />
                            </svg>
                        </button>
                        <a
                            href="/"
                            @click=${(e: Event) => this.navigate(e, "/")}
                            class="self-center ${getLang() === "km"
                                ? "text-3xl font-bold"
                                : "text-2xl font-semibold"} whitespace-nowrap dark:text-white">
                            ${t("header.treasury")}<sub
                                class="text-xs ms-1 text-gray-400"
                                >${t("header.beta")}</sub
                            >
                        </a>
                    </aside>
                    <aside class="inline-flex">
                        <div
                            @click=${this.share}
                            class="${"share" in navigator
                                ? ""
                                : "hidden"} mr-3">
                            <svg
                                class="w-8 h-8 fill-gray-600 dark:fill-gray-400 mr-1"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 576 512">
                                <path
                                    d="M384.5 24l0 72-64 0c-79.5 0-144 64.5-144 144 0 93.4 82.8 134.8 100.6 142.6 2.2 1 4.6 1.4 7.1 1.4l2.5 0c9.8 0 17.8-8 17.8-17.8 0-8.3-5.9-15.5-12.8-20.3-8.9-6.2-19.2-18.2-19.2-40.5 0-45 36.5-81.5 81.5-81.5l30.5 0 0 72c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l136-136c9.4-9.4 9.4-24.6 0-33.9L425.5 7c-6.9-6.9-17.2-8.9-26.2-5.2S384.5 14.3 384.5 24zm-272 72c-44.2 0-80 35.8-80 80l0 256c0 44.2 35.8 80 80 80l256 0c44.2 0 80-35.8 80-80l0-32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 32c0 8.8-7.2 16-16 16l-256 0c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l16 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-16 0z" />
                            </svg>
                        </div>
                        <div class="relative mr-1">
                            <button
                                @click=${this.toggleLang}
                                type="button"
                                class="${getLang() === "km"
                                    ? "text-xl font-medium"
                                    : "text-lg font-medium"} inline-flex items-center justify-center px-0 py-1 text-gray-900 dark:text-white rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
                                ${getLang() === "km"
                                    ? html`<span class="mr-2 text-xl">🇰🇭</span>
                                          ${t("header.khmer")}`
                                    : html`<span class="mr-2 text-xl">🇺🇸</span>
                                          ${t("header.english")}`}
                            </button>
                            ${this.langOpen
                                ? html`
                                      <div
                                          class="absolute top-full right-0 mt-1 z-50 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-32 dark:bg-gray-700">
                                          <ul
                                              class="py-2 text-base text-gray-700 dark:text-gray-200">
                                              <li>
                                                  <button
                                                      @click=${() =>
                                                          this.selectLang("km")}
                                                      class="inline-flex items-center w-full px-4 py-2 text-base hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                                      <span class="mr-2 text-lg"
                                                          >🇰🇭</span
                                                      >
                                                      ${t("header.khmer")}
                                                  </button>
                                              </li>
                                              <li>
                                                  <button
                                                      @click=${() =>
                                                          this.selectLang("en")}
                                                      class="inline-flex items-center w-full px-4 py-2 text-base hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                                      <span class="mr-2 text-lg"
                                                          >🇺🇸</span
                                                      >
                                                      ${t("header.english")}
                                                  </button>
                                              </li>
                                          </ul>
                                      </div>
                                  `
                                : ""}
                        </div>
                    </aside>
                </div>
            </nav>
            <hb-menu></hb-menu>
        `;
    }

    private toggleMenu() {
        const menu = this.shadowRoot?.querySelector<any>("hb-menu");
        if (menu) menu.open = !menu.open;
    }

    private toggleLang() {
        this.langOpen = !this.langOpen;
    }

    private selectLang(language: "en" | "km") {
        setLang(language);
        this.langOpen = false;
        trackEvent("language_changed", { lang: language });
    }

    private async share() {
        if (navigator.share) {
            await navigator.share({
                title: "HeartBank® Treasury",
                text: "Thank with HeartBank®",
                url: window.location.href
            });
        }
    }
}
