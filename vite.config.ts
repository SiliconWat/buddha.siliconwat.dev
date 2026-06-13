import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Lit + Tailwind v4 + Firebase SPA, served via Firebase Hosting.
// - root="src" matches the existing layout (src/index.html as entry).
// - publicDir="../static" copies static/* to dist/ verbatim — robots, sitemap,
//   IndexNow key, /assets/*.
// - Build output goes to <repo>/dist for Firebase Hosting's public dir.
// - The postbuild prerender step (scripts/prerender-meta.mjs) reads
//   dist/index.html + dist/sitemap.xml and writes per-route HTML; it runs
//   from package.json's "build" after `vite build`.
// - vite-plugin-pwa (injectManifest) builds src/sw.ts into dist/sw.js: it
//   precaches the app shell for offline use AND carries the Firebase Cloud
//   Messaging background handler, so a single SW controls scope "/". The web
//   manifest stays the existing static/assets/site.webmanifest (manifest:
//   false), already linked from index.html.

export default defineConfig({
    root: "src",
    publicDir: "../static",
    plugins: [
        tailwindcss(),
        VitePWA({
            strategies: "injectManifest",
            srcDir: ".",
            filename: "sw.ts",
            registerType: "prompt",
            injectRegister: false,
            manifest: false,
            injectManifest: {
                globPatterns: ["**/*.{js,css,html,woff2}"],
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
            },
            devOptions: { enabled: false, type: "module" }
        })
    ],
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        target: "es2021"
    },
    server: {
        port: 60160,
        host: true
    },
    preview: {
        port: 60160,
        host: true
    }
});
