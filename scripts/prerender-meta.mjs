#!/usr/bin/env node
// Postbuild: for each URL in dist/sitemap.xml, write dist/{path}/index.html
// — a copy of the SPA shell with route-specific <title>, description,
// canonical, Open Graph, and Twitter card meta tags injected. The body
// remains the SPA shell; Firebase Hosting serves the more-specific per-route
// file before falling back to the SPA. This gives crawlers and social-media
// scrapers (Twitter, LinkedIn, Slack — none of which execute JS) the correct
// meta in the HTML payload, while the SPA still loads and runs for users.
//
// Landing variant: no publications corpus — just a home page plus a small set
// of STATIC_ROUTES. Keep this in sync with the per-page setSeoMeta() calls in
// src/pages/*.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const SITE = "https://siliconwat.dev";
const DEFAULT_OG_IMAGE =
    "https://siliconwat.dev/assets/web-app-manifest-512x512.png";

const escHtml = (s) =>
    s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const STATIC_ROUTES = {
    "/buddha": {
        title: "Buddha — Silicon Wat ℠",
        description:
            "Buddha at Silicon Wat — the Dharma jewel of the Three Jewels: Khmer Tipiṭaka transcription and scripture alignment, building the Living Tipiṭaka substrate."
    },
    "/login": {
        title: "Sign In — Silicon Wat ℠",
        description:
            "Sign in to Silicon Wat — the Dharma jewel of the Three Jewels: Khmer Tipiṭaka transcription and scripture alignment."
    },
    "/install": {
        title: "Install — Silicon Wat ℠",
        description:
            "Install Silicon Wat — the Dharma jewel of the Three Jewels: Khmer Tipiṭaka transcription and scripture alignment."
    },
    "/settings": {
        title: "Settings — Silicon Wat ℠",
        description:
            "Settings for Silicon Wat — the Dharma jewel of the Three Jewels: Khmer Tipiṭaka transcription and scripture alignment."
    },
    "/tutorials": {
        title: "Tutorials — Silicon Wat ℠",
        description:
            "Tutorials for Silicon Wat — the Dharma jewel of the Three Jewels: Khmer Tipiṭaka transcription and scripture alignment."
    }
};

function metaForRoute(pathname) {
    const s = STATIC_ROUTES[pathname];
    if (s) return { ...s, canonical: `${SITE}${pathname}`, ogType: "website" };
    return null;
}

// Vite emits a normal <head>…</head>; inject before </head> when present,
// otherwise before <body for safety.
function insert(html, snippet) {
    if (/<\/head>/i.test(html))
        return html.replace(/<\/head>/i, `${snippet}</head>`);
    return html.replace(/<body\b/i, `${snippet}<body`);
}

function replaceMeta(html, attr, key, value) {
    const re = new RegExp(
        `<meta\\s+${attr}=["']?${escRe(key)}["']?(?:\\s+[^>]*)?\\/?>`,
        "i"
    );
    const replacement = `<meta ${attr}="${key}" content="${value}">`;
    if (re.test(html)) return html.replace(re, replacement);
    return insert(html, replacement);
}

function replaceLink(html, rel, href) {
    const re = new RegExp(
        `<link\\s+(?:[^>]*\\s)?rel=["']?${escRe(rel)}["']?(?:\\s+[^>]*)?\\/?>`,
        "i"
    );
    const replacement = `<link rel="${rel}" href="${href}">`;
    if (re.test(html)) return html.replace(re, replacement);
    return insert(html, replacement);
}

function replaceTitle(html, title) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
}

function injectMeta(shell, m) {
    const img = m.ogImage ?? DEFAULT_OG_IMAGE;
    const t = escHtml(m.title);
    const d = escHtml(m.description);
    const c = m.canonical;

    let out = shell;
    out = replaceTitle(out, t);
    out = replaceMeta(out, "name", "description", d);
    out = replaceMeta(out, "property", "og:title", t);
    out = replaceMeta(out, "property", "og:description", d);
    out = replaceMeta(out, "property", "og:url", c);
    out = replaceMeta(out, "property", "og:type", m.ogType);
    out = replaceMeta(out, "property", "og:image", img);
    out = replaceMeta(out, "name", "twitter:title", t);
    out = replaceMeta(out, "name", "twitter:description", d);
    out = replaceMeta(out, "name", "twitter:image", img);
    out = replaceLink(out, "canonical", c);
    return out;
}

const SITE_JSON_LD = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Silicon Wat",
    url: "https://siliconwat.dev/",
    logo: "https://siliconwat.dev/assets/web-app-manifest-512x512.png",
    description:
        "Silicon Wat — Khmer Tipiṭaka transcription and alignment (the Living Tipiṭaka).",
    founder: {
        "@type": "Person",
        name: "Thon Ly",
        url: "https://thonly.org/"
    },
    sameAs: [
        "https://siliconwat.com/",
        "https://siliconwat.org/",
        "https://thonly.org/"
    ]
};

const HOME_META = {
    title: "Silicon Wat — Dharma (Khmer Tipiṭaka)",
    description:
        "Silicon Wat — the Dharma jewel of the Three Jewels: Khmer Tipiṭaka transcription and scripture alignment, building the Living Tipiṭaka substrate.",
    canonical: `${SITE}/`,
    ogType: "website"
};

function injectSiteJsonLd(html) {
    const snippet = `<script type="application/ld+json" data-seo-site="true">${JSON.stringify(SITE_JSON_LD)}</script>`;
    const cleared = html.replace(
        /<script\s+type=["']?application\/ld\+json["']?\s+data-seo-site=["']?true["']?[^>]*>[\s\S]*?<\/script>/i,
        ""
    );
    return insert(cleared, snippet);
}

async function main() {
    let shell = await fs.readFile(path.join(DIST, "index.html"), "utf8");
    shell = injectSiteJsonLd(shell);
    const homeHtml = injectMeta(shell, HOME_META);
    await fs.writeFile(path.join(DIST, "index.html"), homeHtml, "utf8");

    const sitemapXml = await fs.readFile(
        path.join(DIST, "sitemap.xml"),
        "utf8"
    );
    const paths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
        .map((m) => new URL(m[1]).pathname)
        .filter((p) => p !== "/" && p !== "");

    let ok = 0;
    let skip = 0;
    for (const p of paths) {
        const meta = metaForRoute(p);
        if (!meta) {
            console.log(`  - skip ${p} (no meta)`);
            skip++;
            continue;
        }
        const html = injectMeta(shell, meta);
        const outDir = path.join(DIST, ...p.split("/").filter(Boolean));
        await fs.mkdir(outDir, { recursive: true });
        await fs.writeFile(path.join(outDir, "index.html"), html, "utf8");
        ok++;
    }
    console.log(`prerender-meta: ${ok} routes generated, ${skip} skipped`);
}

await main().catch((e) => {
    console.error(e);
    process.exit(1);
});
