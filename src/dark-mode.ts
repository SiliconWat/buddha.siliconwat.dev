import { LitElement } from "lit";

const darkModeComponents = new Set<LitElement>();

export function registerDarkMode(el: LitElement) {
    darkModeComponents.add(el);
    syncDarkClass(el);
}

export function unregisterDarkMode(el: LitElement) {
    darkModeComponents.delete(el);
}

function isDark(): boolean {
    const stored = localStorage.getItem("color-scheme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function syncDarkClass(el: LitElement) {
    if (isDark()) {
        el.classList.add("dark");
    } else {
        el.classList.remove("dark");
    }
    el.requestUpdate();
}

export function applyColorScheme() {
    const dark = isDark();
    if (dark) {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
    for (const el of darkModeComponents) {
        syncDarkClass(el);
    }
}

window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
        if (!localStorage.getItem("color-scheme")) {
            applyColorScheme();
        }
    });

applyColorScheme();
