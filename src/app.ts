import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Router } from "@lit-labs/router";
import * as tailwind from "bundle-text:./styles.css";
import { registerDarkMode, unregisterDarkMode } from "./dark-mode.js";
import { trackEvent } from "./analytics.js";

import "./pages/home.js";
import "./pages/login.js";
import "./pages/settings.js";
import "./pages/install.js";
import "./pages/tutorials.js";
import "./pages/dharma.js";
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
        trackEvent("page_view", { path: location.pathname });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        unregisterDarkMode(this);
    }

    private router = new Router(this, [
        { path: "/buddha", render: () => html`<page-home></page-home>` },
        { path: "/login", render: () => html`<page-login></page-login>` },
        {
            path: "/settings",
            render: () => html`<page-settings></page-settings>`
        },
        {
            path: "/install",
            render: () => html`<page-install></page-install>`
        },
        {
            path: "/tutorials",
            render: () => html`<page-tutorials></page-tutorials>`
        },
        {
            path: "/",
            render: () => html`<page-dharma></page-dharma>`
        },
        { path: "/*", render: () => html`<page-not-found></page-not-found>` }
    ]);

    @state() private chromeHidden = false;

    private handleToggleChrome = () => {
        this.chromeHidden = !this.chromeHidden;
    };

    private handleNavigate = (e: CustomEvent) => {
        this.router.goto(e.detail);
        trackEvent("page_view", { path: e.detail });
        window.dispatchEvent(new Event("tutorials:reset"));
    };

    render() {
        return html`
            ${this.chromeHidden
                ? null
                : html`<hb-header
                      @navigate=${this.handleNavigate}></hb-header>`}
            <main
                class="max-w-screen-xl mx-auto px-0 pt-[68px] pb-[70px]"
                @navigate=${this.handleNavigate}
                @toggle-chrome=${this.handleToggleChrome}>
                ${this.router.outlet()}
            </main>
            ${this.chromeHidden
                ? null
                : html`<hb-footer
                      @navigate=${this.handleNavigate}></hb-footer>`}
        `;
    }
}
