import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import * as tailwind from "bundle-text:../styles.css";
import { registerDarkMode, unregisterDarkMode } from "../dark-mode.js";
import { auth } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { Crystal3B } from "../Crystal.js";
import avatar from "url:../assets/avatar.webp";

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

    @state() private signedIn = false;
    private crystal: Crystal3B | null = null;

    connectedCallback() {
        super.connectedCallback();
        registerDarkMode(this);

        onAuthStateChanged(auth, (user) => {
            this.signedIn = !!user;
        });
    }

    protected async updated() {
        if (!this.signedIn && !this.crystal) {
            const canvas =
                this.shadowRoot?.querySelector<HTMLCanvasElement>("canvas");
            if (canvas) {
                const crystal = new Crystal3B(canvas);
                this.crystal = crystal;
                await crystal.init();
                if (this.crystal === crystal) crystal.startAnimation(true);
            }
        } else if (this.signedIn && this.crystal) {
            this.crystal.stopAnimation();
            this.crystal = null;
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        unregisterDarkMode(this);
        this.crystal?.stopAnimation();
    }

    render() {
        return this.signedIn
            ? html`
                  <aside class="relative">
                      <section
                          class="w-full h-full flex items-center justify-center">
                          <picture
                              class="ml-[-16%] mb-[-20%] w-full scale-[1.1] md:scale-[1.5] animate-heartbeat">
                              <svg
                                  class="drop-shadow-2xl w-full h-full"
                                  fill="silver"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24">
                                  <path
                                      class="animate-rainbow"
                                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                      transform="rotate(45 12 12)" />
                              </svg>
                          </picture>
                      </section>
                      <section
                          class="absolute flex-row align-middle items-center ml-[-8%] mt-[10%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <img
                              src="${avatar}"
                              class="w-32 h-32 rounded-full border-5 border-purple-600 shadow-[0_0_0_5px_gold]" />
                          <span
                              class="absolute text-medium font-extralight text-white bottom-1 end-[-5px]"
                              >℠</span
                          >
                      </section>
                  </aside>
              `
            : html`<canvas></canvas>`;
    }
}
