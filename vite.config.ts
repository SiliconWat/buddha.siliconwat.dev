import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// Lit + Tailwind v4 + Firebase SPA, served via Firebase Hosting.
// - root="src" matches the prior Parcel layout (src/index.html as entry).
// - publicDir="../static" copies static/* to dist/ verbatim — robots, sitemap,
//   IndexNow key, /assets/*, firebase-messaging-sw.js, tutorials/.
// - Build output goes to <repo>/dist for Firebase Hosting's public dir.
// - The postbuild prerender step (scripts/prerender-meta.mjs) reads
//   dist/index.html + dist/sitemap.xml and writes per-route HTML; it runs
//   from package.json's "build" after `vite build`.

export default defineConfig({
    root: "src",
    publicDir: "../static",
    plugins: [tailwindcss()],
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
