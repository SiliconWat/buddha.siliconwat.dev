import { onRequest } from "firebase-functions/v2/https";

// --- Link Preview (OG tags for social crawlers) ---

const OG: Record<
    string,
    { title: string; description: string; image: string }
> = {
    "/": {
        title: "HeartBank",
        description: "Send thanks with HeartBank",
        image: "https://thank.333.eco/og-image.png"
    },
    "/about": {
        title: "About — HeartBank",
        description: "Learn more about HeartBank",
        image: "https://thank.333.eco/og-about.png"
    }
};

const CRAWLERS =
    /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator|whatsapp|telegram/i;

export const previewLink = onRequest(
    { region: "asia-southeast1" },
    (req, res) => {
        const userAgent = req.headers["user-agent"] || "";
        const path = req.path.replace(/^\/3/, "") || "/";

        if (!CRAWLERS.test(userAgent)) {
            res.redirect(301, `https://thank.333.eco${path}`);
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
    <meta property="og:url" content="https://thank.333.eco${path}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${tags.title}" />
    <meta name="twitter:description" content="${tags.description}" />
    <meta name="twitter:image" content="${tags.image}" />
</head>
<body></body>
</html>`);
    }
);
