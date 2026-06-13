import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Router } from "@lit-labs/router";
import tailwind from "./styles.css?inline";
import { registerDarkMode, unregisterDarkMode } from "./dark-mode.js";
import { trackEvent, registerErrorTracking } from "./analytics.js";
import { registerSW } from "virtual:pwa-register";
import { showUpdateToast } from "./components/hb-update-toast.js";

// Register the service worker (offline app shell + FCM). registerType is
// "prompt": when a new version is installed, show a toast; the user's click
// activates the waiting worker and reloads the page.
const updateSW = registerSW({
    onNeedRefresh() {
        showUpdateToast(() => updateSW(true));
    }
});

import "./pages/home.js";
import "./pages/about.js";
import "./pages/login.js";
import "./pages/settings.js";
import "./pages/not-found.js";
import "./components/hb-header.js";
import "./components/hb-footer.js";

@customElement("hb-app")
export class HbApp extends LitElement {
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
        registerErrorTracking();
        trackEvent("page_view", { path: location.pathname });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        unregisterDarkMode(this);
    }

    private router = new Router(this, [
        { path: "/", render: () => html`<page-home></page-home>` },
        { path: "/about", render: () => html`<page-about></page-about>` },
        { path: "/login", render: () => html`<page-login></page-login>` },
        {
            path: "/settings",
            render: () => html`<page-settings></page-settings>`
        },
        { path: "/*", render: () => html`<page-not-found></page-not-found>` }
    ]);

    @state() private chromeHidden = false;

    private navigateTo(path: string) {
        // Always restore the chrome when leaving the home page.
        this.chromeHidden = false;
        this.router.goto(path);
        trackEvent("page_view", { path });
        // Reset scroll on cross-route navigation; preserve hash-anchor scroll
        // when the target URL includes a fragment.
        if (!path.includes("#")) {
            window.scrollTo({ top: 0, behavior: "instant" });
        }
    }

    private handleNavigate = (e: CustomEvent) => {
        this.navigateTo(String(e.detail));
    };

    // Tapping the fullscreen home video: first tap hides the chrome, second
    // tap reveals it again and navigates to /about.
    private handleToggleChrome = () => {
        if (this.chromeHidden) {
            this.navigateTo("/about");
            return;
        }
        this.chromeHidden = true;
        trackEvent("chrome_toggle", { state: "hidden" });
    };

    render() {
        return html`
            <hb-header
                ?collapsed=${this.chromeHidden}
                @navigate=${this.handleNavigate}></hb-header>
            <main
                class="max-w-screen-xl mx-auto px-0 pt-[68px] pb-[70px]"
                @navigate=${this.handleNavigate}
                @toggle-chrome=${this.handleToggleChrome}>
                ${this.router.outlet()}
            </main>
            <hb-footer
                ?collapsed=${this.chromeHidden}
                @navigate=${this.handleNavigate}></hb-footer>
        `;
    }
}
