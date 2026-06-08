import { onRequest } from "firebase-functions/v2/https";

// Social-crawler Open Graph endpoint. Firebase Hosting rewrites /3/** to this
// function (see firebase.json). Crawlers that do not execute JS (Twitter,
// LinkedIn, Slack, WhatsApp, Telegram, …) get a minimal HTML payload with the
// correct OG/Twitter tags; ordinary visitors are 301'd to the canonical URL,
// where the SPA + prerendered per-route meta take over.

const SITE = "https://siliconwat.dev";
const OG_IMAGE = `${SITE}/assets/web-app-manifest-512x512.png`;

const OG: Record<
    string,
    { title: string; description: string; image: string }
> = {
    "/": {
        title: "Silicon Wat — Dharma (Khmer Tipiṭaka)",
        description:
            "Silicon Wat — the Dharma jewel of the Three Jewels: Khmer Tipiṭaka transcription and scripture alignment, building the Living Tipiṭaka substrate.",
        image: OG_IMAGE
    },
    "/buddha": {
        title: "Buddha — Silicon Wat ℠",
        description:
            "Buddha at Silicon Wat — the Dharma jewel of the Three Jewels: Khmer Tipiṭaka transcription and scripture alignment, building the Living Tipiṭaka substrate.",
        image: OG_IMAGE
    }
};

const CRAWLERS =
    /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator|whatsapp|telegram/i;

export const linkPreview = onRequest(
    { region: "asia-southeast1" },
    (req, res) => {
        const userAgent = req.headers["user-agent"] || "";
        const path = req.path.replace(/^\/3/, "") || "/";

        if (!CRAWLERS.test(userAgent)) {
            res.redirect(301, `${SITE}${path}`);
            return;
        }

        const tags = OG[path] || OG["/"];

        res.status(200).send(`<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${tags.title}</title>
    <meta property="og:title" content="${tags.title}" />
    <meta property="og:description" content="${tags.description}" />
    <meta property="og:image" content="${tags.image}" />
    <meta property="og:url" content="${SITE}${path}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Silicon Wat ℠" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${tags.title}" />
    <meta name="twitter:description" content="${tags.description}" />
    <meta name="twitter:image" content="${tags.image}" />
</head>
<body></body>
</html>`);
    }
);
