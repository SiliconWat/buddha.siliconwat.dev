// Per-route SEO meta helper. Each page may call setSeoMeta in connectedCallback
// to override the default <head> from index.html with route-specific values.
// (Landing variant — no publications corpus, so no per-publication helper.)

const DEFAULT_OG_IMAGE =
    "https://siliconwat.dev/assets/web-app-manifest-512x512.png";

export interface SeoMeta {
    title: string;
    description: string;
    canonical: string;
    ogImage?: string;
    ogType?: "website" | "article";
}

export function setSeoMeta(m: SeoMeta): void {
    document.title = m.title;
    setMeta("name", "description", m.description);
    setMeta("property", "og:title", m.title);
    setMeta("property", "og:description", m.description);
    setMeta("property", "og:url", m.canonical);
    setMeta("property", "og:type", m.ogType ?? "article");
    setMeta("property", "og:image", m.ogImage ?? DEFAULT_OG_IMAGE);
    setMeta("name", "twitter:title", m.title);
    setMeta("name", "twitter:description", m.description);
    setMeta("name", "twitter:image", m.ogImage ?? DEFAULT_OG_IMAGE);
    setLink("canonical", m.canonical);
}

export function setJsonLd(obj: object): void {
    let s = document.head.querySelector(
        'script[type="application/ld+json"][data-seo-page="true"]'
    );
    if (!s) {
        s = document.createElement("script");
        s.setAttribute("type", "application/ld+json");
        s.setAttribute("data-seo-page", "true");
        document.head.appendChild(s);
    }
    s.textContent = JSON.stringify(obj);
}

function setMeta(
    attr: "name" | "property",
    key: string,
    content: string
): void {
    let m = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!m) {
        m = document.createElement("meta");
        m.setAttribute(attr, key);
        document.head.appendChild(m);
    }
    m.setAttribute("content", content);
}

function setLink(rel: string, href: string): void {
    let l = document.head.querySelector(`link[rel="${rel}"]`);
    if (!l) {
        l = document.createElement("link");
        l.setAttribute("rel", rel);
        document.head.appendChild(l);
    }
    l.setAttribute("href", href);
}
