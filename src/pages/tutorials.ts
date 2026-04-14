import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import * as tailwind from "bundle-text:../styles.css";
import { registerDarkMode, unregisterDarkMode } from "../dark-mode.js";
import { registerI18n, unregisterI18n, t, getLang } from "../i18n.js";
import { trackEvent } from "../analytics.js";

interface Tutorial {
    key: string;
    icon: string;
    stepsCount: number;
    enabled: boolean;
}

const TUTORIALS: Tutorial[] = [
    { key: "installApp", icon: "📲", stepsCount: 7, enabled: true },
    { key: "phoneLogin", icon: "🔐", stepsCount: 10, enabled: true },
    { key: "notifications", icon: "🔔", stepsCount: 5, enabled: true },
    { key: "familyBank", icon: "🏦", stepsCount: 3, enabled: false },
    { key: "familyMember", icon: "👨‍👩‍👧‍👦", stepsCount: 4, enabled: false },
    { key: "thankMyself", icon: "🫶🏼", stepsCount: 0, enabled: false },
    { key: "sendThanks", icon: "💝", stepsCount: 3, enabled: false }
];

@customElement("page-tutorials")
export class PageTutorials extends LitElement {
    static styles = [
        unsafeCSS(tailwind),
        css`
            :host {
                display: block;
                width: 100%;
            }
            .card {
                width: calc(100vw - 3rem);
                max-width: 28rem;
                margin: 0 auto;
            }
        `
    ];

    @state() private selected: Tutorial | null = null;
    @state() private currentStep = 0;

    private handleHashChange = () => {
        const hash = location.hash.slice(1);
        if (hash) {
            const tutorial = TUTORIALS.find((t) => t.key === hash && t.enabled);
            if (tutorial) this.openTutorial(tutorial);
        } else {
            this.selected = null;
            this.currentStep = 0;
        }
    };

    connectedCallback() {
        super.connectedCallback();
        registerDarkMode(this);
        registerI18n(this);
        this.handleHashChange();
        window.addEventListener("hashchange", this.handleHashChange);
        window.addEventListener("tutorials:reset", this.handleHashChange);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        unregisterDarkMode(this);
        unregisterI18n(this);
        window.removeEventListener("hashchange", this.handleHashChange);
        window.removeEventListener("tutorials:reset", this.handleHashChange);
    }

    private openTutorial(tutorial: Tutorial) {
        if (!tutorial.enabled) return;
        this.selected = tutorial;
        this.currentStep = 0;
        location.hash = tutorial.key;
        trackEvent("tutorial_opened", { tutorial: tutorial.key });
    }

    private closeTutorial() {
        this.selected = null;
        this.currentStep = 0;
        history.replaceState(null, "", location.pathname);
    }

    private nextStep() {
        if (this.selected && this.currentStep < this.selected.stepsCount - 1) {
            this.currentStep++;
        }
    }

    private prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
        }
    }

    private getStepImage(): string {
        if (!this.selected) return "";
        return `/tutorials/${this.selected.key}/${getLang()}-${this.currentStep + 1}.jpg`;
    }

    private renderTutorial() {
        if (!this.selected) return "";
        const key = this.selected.key;

        return html`
            <div class="p-6 space-y-4 sm:p-8">
                <div class="flex items-start justify-between">
                    <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                        ${this.selected.icon} ${t(`tutorial.${key}.title`)}
                    </h1>
                    <button
                        @click=${this.closeTutorial}
                        class="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div class="flex items-center gap-1 mb-4">
                    ${Array.from(
                        { length: this.selected.stepsCount },
                        (_, i) => html`
                            <div
                                class="h-1 flex-1 rounded-full ${i <=
                                this.currentStep
                                    ? "bg-yellow-500"
                                    : "bg-gray-200 dark:bg-gray-600"}"></div>
                        `
                    )}
                </div>

                <img
                    src=${this.getStepImage()}
                    alt="${t(`tutorial.${key}.title`)} - ${t(
                        "tutorial.step"
                    )} ${this.currentStep + 1}"
                    class="w-full rounded-lg border border-gray-200 dark:border-gray-600"
                    @error=${(e: Event) =>
                        ((e.target as HTMLImageElement).style.display = "none")}
                    @load=${(e: Event) =>
                        ((e.target as HTMLImageElement).style.display = "")} />

                <div
                    class="p-4 bg-gray-50 rounded-lg dark:bg-gray-700 min-h-[80px]">
                    <p
                        class="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                        ${t("tutorial.step")}
                        ${this.currentStep + 1}/${this.selected.stepsCount}
                    </p>
                    <p class="text-gray-700 dark:text-gray-300">
                        ${t(`tutorial.${key}.step${this.currentStep + 1}`)}
                    </p>
                </div>

                <div class="flex gap-3">
                    <button
                        @click=${this.prevStep}
                        ?disabled=${this.currentStep === 0}
                        class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        ${t("tutorial.prev")}
                    </button>
                    ${this.currentStep < this.selected.stepsCount - 1
                        ? html`
                              <button
                                  @click=${this.nextStep}
                                  class="flex-1 px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600">
                                  ${t("tutorial.next")}
                              </button>
                          `
                        : html`
                              <button
                                  @click=${this.closeTutorial}
                                  class="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600">
                                  ${t("tutorial.done")}
                              </button>
                          `}
                </div>
            </div>
        `;
    }

    private renderList() {
        return html`
            <div class="p-6 space-y-4 sm:p-8">
                <h1
                    class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                    ${t("tutorials.title")}
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    ${t("tutorials.description")}
                </p>
                <ul class="space-y-3">
                    ${TUTORIALS.map(
                        (tut) => html`
                            <li>
                                <button
                                    @click=${() => this.openTutorial(tut)}
                                    ?disabled=${!tut.enabled}
                                    class="flex items-center w-full p-3 text-left rounded-lg transition ${tut.enabled
                                        ? "text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 cursor-pointer"
                                        : "text-gray-400 bg-gray-50 dark:bg-gray-700/50 dark:text-gray-500 cursor-not-allowed opacity-80"}">
                                    <span class="text-2xl mr-3"
                                        >${tut.icon}</span
                                    >
                                    <div>
                                        <h3 class="text-sm font-medium">
                                            ${t(`tutorial.${tut.key}.title`)}
                                        </h3>
                                        <p
                                            class="text-xs ${tut.enabled
                                                ? "text-gray-500 dark:text-gray-400"
                                                : "text-gray-400 dark:text-gray-500"}">
                                            ${tut.enabled
                                                ? `${tut.stepsCount} ${t("tutorial.steps")}`
                                                : t("tutorial.comingSoon")}
                                        </p>
                                    </div>
                                    ${tut.enabled
                                        ? html`
                                              <svg
                                                  class="w-4 h-4 ml-auto text-gray-400"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24">
                                                  <path
                                                      stroke-linecap="round"
                                                      stroke-linejoin="round"
                                                      stroke-width="2"
                                                      d="M9 5l7 7-7 7"></path>
                                              </svg>
                                          `
                                        : ""}
                                </button>
                            </li>
                        `
                    )}
                </ul>
            </div>
        `;
    }

    render() {
        return html`
            <div class="py-8">
                <div
                    class="card overflow-hidden bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700">
                    ${this.selected ? this.renderTutorial() : this.renderList()}
                </div>
            </div>
        `;
    }
}
