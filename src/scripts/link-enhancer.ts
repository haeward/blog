type LinkEnhancerWindow = Window & {
    __linkEnhancerState?: { bound: boolean };
};

function enhanceLinks(): void {
    const article = document.querySelector("article");
    if (!article) return;

    const links = article.querySelectorAll("a");

    links.forEach((link) => {
        const href = link.getAttribute("href");
        if (!href) return;

        processLink(link as HTMLAnchorElement, href);
    });
}

function processLink(link: HTMLAnchorElement, href: string): void {
    if (href.startsWith("http://") || href.startsWith("https://")) {
        processExternalLink(link);
    }

    if (link.hasAttribute("aria-label")) return;

    const text = link.textContent?.trim();
    if (!text) return;

    if (href.startsWith("http")) {
        try {
            const domain = new URL(href).hostname;
            link.setAttribute("aria-label", `${text} - External link to ${domain}`);
        } catch {
            link.setAttribute("aria-label", `${text} - External link`);
        }
    } else if (href.startsWith("mailto:")) {
        link.setAttribute("aria-label", `Send email to ${text}`);
    } else {
        link.setAttribute("aria-label", `Internal link: ${text}`);
    }
}

function processExternalLink(link: HTMLAnchorElement): void {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
}

const globalWindow = window as LinkEnhancerWindow;
globalWindow.__linkEnhancerState ??= { bound: false };

const linkEnhancerState = globalWindow.__linkEnhancerState;
if (!linkEnhancerState.bound) {
    linkEnhancerState.bound = true;
    document.addEventListener("DOMContentLoaded", enhanceLinks);
    document.addEventListener("astro:page-load", enhanceLinks);
}

enhanceLinks();

export {};
