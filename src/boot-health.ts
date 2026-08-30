// Boot health marker — read by the service worker, written by the page.
//
// The update flow is registerType "prompt": a new worker waits until the user
// clicks the refresh toast. That is the behaviour we want, with one exception —
// an install that renders nothing can never show the toast, so it would wait
// for ever while the broken shell keeps being served out of precache. That is
// not hypothetical: it is exactly what a missing URLPattern did to every
// Safari < 26 visitor (see the note atop src/app.ts).
//
// So the worker needs to tell a working install from a dead one. The page
// writes this marker once a route has actually rendered content; the worker
// treats its absence as "this install has never once worked" and only then
// takes over uninvited. Nobody has to remember to switch anything off.
//
// Cache Storage rather than localStorage, because a service worker can read it.
export const BOOT_CACHE = "app-health";
export const BOOT_MARKER = "/__booted";

export async function reportBoot(): Promise<void> {
    try {
        const cache = await caches.open(BOOT_CACHE);
        if (await cache.match(BOOT_MARKER)) return;
        await cache.put(BOOT_MARKER, new Response("1"));
    } catch {
        // Private browsing, disabled storage, quota. Health reporting must
        // never be able to break the page it reports on; a missing marker
        // only costs one un-prompted update.
    }
}
