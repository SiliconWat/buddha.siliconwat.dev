/// <reference lib="webworker" />
// Service worker (vite-plugin-pwa, injectManifest strategy).
// Responsibilities:
//   1. Precache the built app shell (hashed JS/CSS + index.html) so the app
//      opens offline, with a SPA navigation fallback to index.html.
//   2. Firebase Cloud Messaging background handler — replaces the old
//      static/firebase-messaging-sw.js (one SW now controls scope "/").
//   3. Activate-on-demand for the "new version" refresh toast: the waiting
//      worker only takes over when the client posts SKIP_WAITING.
import {
    precacheAndRoute,
    cleanupOutdatedCaches,
    createHandlerBoundToURL
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: unknown[] };

// --- Firebase Cloud Messaging (background) ---
// siliconwat.dev — Silicon Wat ℠ Dharma jewel Firebase project (siliconwat-98373).
// Must match src/firebase.ts.
const app = initializeApp({
    apiKey: "AIzaSyDCSzWQF6lX7tTsiQcYxpZZpfB8m2lU_1I",
    authDomain: "siliconwat-98373.firebaseapp.com",
    projectId: "siliconwat-98373",
    storageBucket: "siliconwat-98373.firebasestorage.app",
    messagingSenderId: "1091231177300",
    appId: "1:1091231177300:web:5b9a73735225b00ecfabc1",
    measurementId: "G-1LZ5Z3X993"
});
const messaging = getMessaging(app);
// Display handled by the FCM SDK from the notification payload; the handler is
// registered so background messages are processed.
onBackgroundMessage(messaging, () => {});

// --- Offline app shell ---
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
// SPA fallback: serve cached index.html for navigations so the app boots
// offline. Firebase auth/messaging internal routes are left to the network.
registerRoute(
    new NavigationRoute(createHandlerBoundToURL("/index.html"), {
        denylist: [/^\/firebase-/, /\/__\//]
    })
);
// Same-origin static assets (icons, images, fonts) become available offline
// after first fetch.
registerRoute(
    ({ request, url }) =>
        url.origin === self.location.origin &&
        ["image", "font", "style"].includes(request.destination),
    new StaleWhileRevalidate({ cacheName: "static-assets" })
);

// --- Update flow ---
// First install controls the page immediately; updates wait until the refresh
// toast posts SKIP_WAITING (registerType: "prompt").
self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});
self.addEventListener("message", (event) => {
    if ((event as ExtendableMessageEvent).data?.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
