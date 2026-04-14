import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import * as tailwind from "bundle-text:../styles.css";
import { registerDarkMode, unregisterDarkMode } from "../dark-mode.js";
import { registerI18n, unregisterI18n, t } from "../i18n.js";
import { trackEvent } from "../analytics.js";
import { auth } from "../firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import hbLogo from "url:../assets/hb.svg";
import waLogo from "url:../assets/wa.svg";

@customElement("hb-menu")
export class HbMenu extends LitElement {
    static styles = [
        unsafeCSS(tailwind),
        css`
            :host {
                display: block;
            }
        `
    ];

    @property({ type: Boolean, reflect: true }) open = false;
    @state() private signedIn = false;
    @state() private accountsOpen = false;

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

    private async handleSignOut() {
        trackEvent("sign_out");
        await signOut(auth);
        this.open = false;
    }

    render() {
        return html`
            <div
                class="fixed inset-0 bg-gray-900/50 z-40 transition-opacity ${this
                    .open
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"}"
                @click=${() => (this.open = false)}></div>
            <div
                class="h-screen md:h-full fixed top-0 left-0 z-50 p-4 pb-10 overflow-y-hidden transition-transform bg-white w-64 dark:bg-gray-800  ${this
                    .open
                    ? "translate-x-0"
                    : "-translate-x-full"}"
                tabindex="-1">
                <a href="/" @click=${(e: Event) => this.navigate(e, "/")}>
                    <h2
                        class="text-xl font-black text-gray-500 dark:text-gray-400">
                        Silicon Wat ℠
                    </h2>
                </a>
                <button
                    type="button"
                    @click=${() => (this.open = false)}
                    data-drawer-hide="hb-menu"
                    aria-controls="hb-menu"
                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg
                        class="w-3 h-3"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14">
                        <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                    </svg>
                    <span class="sr-only">${t("menu.closeMenu")}</span>
                </button>
                <div class="h-full py-4 overflow-y-auto">
                    <ul class="space-y-2 font-medium">
                        ${this.signedIn
                            ? html`
                                  <li>
                                      <button
                                          type="button"
                                          class="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                                          @click=${() =>
                                              (this.accountsOpen =
                                                  !this.accountsOpen)}>
                                          <svg
                                              class="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                                              aria-hidden="true"
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="skyblue"
                                              viewBox="0 0 512 512">
                                              <path
                                                  d="M271.9 20.2c-9.8-5.6-21.9-5.6-31.8 0l-224 128c-12.6 7.2-18.8 22-15.1 36S17.5 208 32 208l32 0 0 208 0 0-51.2 38.4C4.7 460.4 0 469.9 0 480 0 497.7 14.3 512 32 512l448 0c17.7 0 32-14.3 32-32 0-10.1-4.7-19.6-12.8-25.6l-51.2-38.4 0-208 32 0c14.5 0 27.2-9.8 30.9-23.8s-2.5-28.8-15.1-36l-224-128zM400 208l0 208-64 0 0-208 64 0zm-112 0l0 208-64 0 0-208 64 0zm-112 0l0 208-64 0 0-208 64 0zM256 96a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
                                          </svg>
                                          <span
                                              class="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap"
                                              >${t("menu.familyBank")}</span
                                          >
                                          <svg
                                              class="${this.accountsOpen
                                                  ? "rotate-180"
                                                  : ""} w-3 h-3"
                                              aria-hidden="true"
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="none"
                                              viewBox="0 0 10 6">
                                              <path
                                                  stroke="currentColor"
                                                  stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                  stroke-width="2"
                                                  d="m1 1 4 4 4-4" />
                                          </svg>
                                      </button>
                                      <ul
                                          class="${this.accountsOpen
                                              ? ""
                                              : "hidden"} py-2 space-y-2">
                                          <li>
                                              <a
                                                  href="/account#son"
                                                  @click=${(e: Event) =>
                                                      this.navigate(
                                                          e,
                                                          "/account#son"
                                                      )}
                                                  class="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                                                  @son
                                              </a>
                                          </li>
                                          <li>
                                              <a
                                                  href="/account#daughter"
                                                  @click=${(e: Event) =>
                                                      this.navigate(
                                                          e,
                                                          "/account#daughter"
                                                      )}
                                                  class="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                                                  @daughter
                                              </a>
                                          </li>
                                      </ul>
                                  </li>
                                  <li>
                                      <a
                                          href="/create"
                                          @click=${(e: Event) =>
                                              this.navigate(e, "/create")}
                                          class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                          <svg
                                              class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                              aria-hidden="true"
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="pink"
                                              viewBox="0 0 576 512">
                                              <path
                                                  d="M288-32a96 96 0 1 1 0 192 96 96 0 1 1 0-192zM48 304c0-70.1 47-131.4 117.1-164.9 25.3 41.3 70.9 68.9 122.9 68.9 55.7 0 104.1-31.7 128-78 15.8-11.3 35.1-18 56-18l19.5 0c10.4 0 18 9.8 15.5 19.9l-17.1 68.3c9.9 12.4 18.2 25.7 24.4 39.8l21.7 0c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24l-40 0c-16.5 22-38.5 39.6-64 50.7l0 29.3c0 17.7-14.3 32-32 32l-33 0c-14.3 0-26.8-9.5-30.8-23.2l-7.1-24.8-82.3 0-7.1 24.8C235.8 502.5 223.3 512 209 512l-33 0c-17.7 0-32-14.3-32-32l0-29.3C87.5 426 48 369.6 48 304zm376 16a24 24 0 1 0 0-48 24 24 0 1 0 0 48z" />
                                          </svg>
                                          <span
                                              class="flex-1 ms-3 whitespace-nowrap">
                                              ${t("menu.createAccount")}
                                          </span>
                                      </a>
                                  </li>
                                  <li>
                                      <hr
                                          class="w-48 h-1 mx-auto my-4 bg-gray-100 border-0 rounded-sm md:my-10 dark:bg-gray-700" />
                                  </li>
                                  <li>
                                      <a
                                          href="/humanity"
                                          @click=${(e: Event) =>
                                              this.navigate(e, "/humanity")}
                                          class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                          <svg
                                              class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                              aria-hidden="true"
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="red"
                                              viewBox="0 0 24 24">
                                              <path
                                                  stroke="red"
                                                  stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                  stroke-width="2"
                                                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                                  transform="rotate(45 12 12)" />
                                          </svg>
                                          <span
                                              class="flex-1 ms-3 whitespace-nowrap">
                                              ${t("menu.proofOfHumanity")}
                                          </span>
                                      </a>
                                  </li>
                                  <li>
                                      <a
                                          href="/settings"
                                          @click=${(e: Event) =>
                                              this.navigate(e, "/settings")}
                                          class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                          <svg
                                              class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                              aria-hidden="true"
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="silver"
                                              viewBox="0 0 512 512">
                                              <path
                                                  d="M195.1 9.5C198.1-5.3 211.2-16 226.4-16l59.8 0c15.2 0 28.3 10.7 31.3 25.5L332 79.5c14.1 6 27.3 13.7 39.3 22.8l67.8-22.5c14.4-4.8 30.2 1.2 37.8 14.4l29.9 51.8c7.6 13.2 4.9 29.8-6.5 39.9L447 233.3c.9 7.4 1.3 15 1.3 22.7s-.5 15.3-1.3 22.7l53.4 47.5c11.4 10.1 14 26.8 6.5 39.9l-29.9 51.8c-7.6 13.1-23.4 19.2-37.8 14.4l-67.8-22.5c-12.1 9.1-25.3 16.7-39.3 22.8l-14.4 69.9c-3.1 14.9-16.2 25.5-31.3 25.5l-59.8 0c-15.2 0-28.3-10.7-31.3-25.5l-14.4-69.9c-14.1-6-27.2-13.7-39.3-22.8L73.5 432.3c-14.4 4.8-30.2-1.2-37.8-14.4L5.8 366.1c-7.6-13.2-4.9-29.8 6.5-39.9l53.4-47.5c-.9-7.4-1.3-15-1.3-22.7s.5-15.3 1.3-22.7L12.3 185.8c-11.4-10.1-14-26.8-6.5-39.9L35.7 94.1c7.6-13.2 23.4-19.2 37.8-14.4l67.8 22.5c12.1-9.1 25.3-16.7 39.3-22.8L195.1 9.5zM256.3 336a80 80 0 1 0 -.6-160 80 80 0 1 0 .6 160z" />
                                          </svg>
                                          <span
                                              class="flex-1 ms-3 whitespace-nowrap">
                                              ${t("menu.settings")}
                                          </span>
                                      </a>
                                  </li>
                                  <li>
                                      <button
                                          type="button"
                                          @click=${this.handleSignOut}
                                          class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                          <svg
                                              class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                              aria-hidden="true"
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="currentColor"
                                              viewBox="0 0 512 512">
                                              <path
                                                  d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z" />
                                          </svg>
                                          <span
                                              class="flex-1 ms-3 whitespace-nowrap"
                                              >${t("menu.logOut")}
                                          </span>
                                      </button>
                                  </li>
                              `
                            : html`
                                  <li>
                                      <a
                                          href="https://bedok.siliconwat.org"
                                          target="_blank"
                                          @click=${() =>
                                              trackEvent("external_link", {
                                                  url: "bedok.siliconwat.org"
                                              })}
                                          class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                          <svg
                                              class="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                                              aria-hidden="true"
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="orangered"
                                              viewBox="0 0 448 512">
                                              <path
                                                  d="M96 512l320 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-66.7c18.6-6.6 32-24.4 32-45.3l0-288c0-26.5-21.5-48-48-48l-48 0 0 169.4c0 12.5-10.1 22.6-22.6 22.6-6 0-11.8-2.4-16-6.6L272 144 230.6 185.4c-4.2 4.2-10 6.6-16 6.6-12.5 0-22.6-10.1-22.6-22.6L192 0 96 0C43 0 0 43 0 96L0 416c0 53 43 96 96 96zM64 416c0-17.7 14.3-32 32-32l256 0 0 64-256 0c-17.7 0-32-14.3-32-32z" />
                                          </svg>
                                          <span
                                              class="flex-1 ms-3 whitespace-nowrap"
                                              >${t("menu.readBedok")}
                                          </span>
                                      </a>
                                  </li>
                                  <li>
                                      <a
                                          href="/signup"
                                          @click=${(e: Event) =>
                                              this.navigate(e, "/signup")}
                                          class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                          <svg
                                              class="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                                              aria-hidden="true"
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="orange"
                                              viewBox="0 0 512 512">
                                              <path
                                                  d="M0 72C0 58.8 10.7 48 24 48l48 0c13.3 0 24 10.7 24 24l0 104 24 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-96 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l24 0 0-80-24 0C10.7 96 0 85.3 0 72zM30.4 301.2C41.8 292.6 55.7 288 70 288l4.9 0c33.7 0 61.1 27.4 61.1 61.1 0 19.6-9.4 37.9-25.2 49.4l-24 17.5 33.2 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-90.7 0C13.1 464 0 450.9 0 434.7 0 425.3 4.5 416.5 12.1 411l70.5-51.3c3.4-2.5 5.4-6.4 5.4-10.6 0-7.2-5.9-13.1-13.1-13.1L70 336c-3.9 0-7.7 1.3-10.8 3.6L38.4 355.2c-10.6 8-25.6 5.8-33.6-4.8S-1 324.8 9.6 316.8l20.8-15.6zM224 64l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 160l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 160l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z" />
                                          </svg>
                                          <span
                                              class="flex-1 ms-3 whitespace-nowrap"
                                              >${t("menu.createFamilyBank")}
                                          </span>
                                      </a>
                                  </li>
                                  <li class="hidden">
                                      <a
                                          href="/login"
                                          @click=${(e: Event) =>
                                              this.navigate(e, "/login")}
                                          class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                          <svg
                                              class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                              aria-hidden="true"
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="currentColor"
                                              viewBox="0 0 512 512">
                                              <path
                                                  stroke="currentColor"
                                                  stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                  stroke-width="2"
                                                  d="M352 96l64 0c17.7 0 32 14.3 32 32l0 256c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0c53 0 96-43 96-96l0-256c0-53-43-96-96-96l-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32zm-9.4 182.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L242.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z" />
                                          </svg>
                                          <span
                                              class="flex-1 ms-3 whitespace-nowrap"
                                              >${t("menu.phoneLogin")}
                                          </span>
                                      </a>
                                  </li>
                              `}
                        <li>
                            <hr
                                class="w-48 h-1 mx-auto my-4 bg-gray-100 border-0 rounded-sm md:my-10 dark:bg-gray-700" />
                        </li>
                        <li>
                            <a
                                href="mailto:buddha@siliconwat.dev"
                                target="_blank"
                                @click=${() =>
                                    trackEvent("external_link", {
                                        url: "mailto:buddha@siliconwat.dev"
                                    })}
                                class="text-xs font-black text-gray-500 dark:text-gray-400">
                                <span class="text-xl mr-2">💌</span>
                                buddha@siliconwat.dev
                            </a>
                        </li>
                        <li class="hidden">
                            <a
                                href="https://wa.me/18005984265"
                                target="_blank"
                                @click=${() =>
                                    trackEvent("external_link", {
                                        url: "WhatsApp"
                                    })}
                                class="text-xs font-black text-gray-500 dark:text-gray-400">
                                <img
                                    class="inline w-[20px] h-[20px] mr-1"
                                    src="${waLogo}" />
                                +1 (800) 59-THANK
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://facebook.com/siliconwat"
                                target="_blank"
                                @click=${() =>
                                    trackEvent("external_link", {
                                        url: "Facebook"
                                    })}
                                class="text-xs text-gray-500 dark:text-gray-400"
                                >Facebook</a
                            >
                        </li>
                        <li>
                            <a
                                href="https://youtube.com/@SiliconWat"
                                target="_blank"
                                @click=${() =>
                                    trackEvent("external_link", {
                                        url: "YouTube"
                                    })}
                                class="text-xs text-gray-500 dark:text-gray-400">
                                YouTube
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://thonly.org"
                                target="_blank"
                                @click=${() =>
                                    trackEvent("external_link", {
                                        url: "thonly.org"
                                    })}
                                class="text-xs font-black text-gray-500 dark:text-gray-400">
                                THonly™ © 2026
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        `;
    }
}
