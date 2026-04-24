type Theme = "system" | "light" | "dark";

type SiteState = {
    bound: boolean;
    initBound?: boolean;
};

type SiteWindow = Window & {
    __siteState?: SiteState;
};

const globalWindow = window as SiteWindow;
globalWindow.__siteState ??= { bound: false };

const siteState = globalWindow.__siteState;
const themeLabels = {
    system: "System",
    light: "Light",
    dark: "Dark",
} satisfies Record<Theme, string>;
const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

function init(): void {
    syncTheme(getStoredTheme());
    onScroll();
    animate();
}

function bindOnce(): void {
    if (siteState.bound) return;
    siteState.bound = true;

    document.addEventListener("click", handleDocumentClick);
    window.addEventListener("scroll", onScroll, { passive: true });

    const handleSchemeChange = (event: MediaQueryListEvent) => {
        if (getStoredTheme() === "system") {
            syncTheme("system", event.matches);
        }
    };

    if (colorSchemeMediaQuery.addEventListener) {
        colorSchemeMediaQuery.addEventListener("change", handleSchemeChange);
    } else if ("onchange" in colorSchemeMediaQuery) {
        colorSchemeMediaQuery.onchange = handleSchemeChange;
    }
}

function handleDocumentClick(event: MouseEvent): void {
    if (!(event.target instanceof Element)) return;

    const themeToggle = event.target.closest("#theme-toggle");
    if (themeToggle) {
        event.preventDefault();
        const nextTheme = getNextTheme(resolveTheme(getStoredTheme()));
        localStorage.setItem("theme", nextTheme);
        syncTheme(nextTheme);
        return;
    }

    const backToTop = event.target.closest("#back-to-top");
    if (backToTop) {
        event.preventDefault();
        scrollToTop();
        return;
    }

    const backToPrev = event.target.closest("#back-to-prev");
    if (backToPrev) {
        event.preventDefault();
        window.history.back();
        return;
    }

    const pre = event.target.closest("pre");
    if (pre instanceof HTMLElement) {
        void tryCopyCode(pre, event);
    }
}

async function tryCopyCode(pre: HTMLElement, event: MouseEvent): Promise<void> {
    if (!navigator?.clipboard?.writeText) return;

    const rect = pre.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x <= rect.width - 40 || x >= rect.width - 8 || y <= 8 || y >= 40) return;

    const code = pre.textContent || "";
    if (!code) return;

    try {
        await navigator.clipboard.writeText(code);

        pre.style.setProperty(
            "--copy-icon",
            "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='%23ffffff'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M5 13l4 4L19 7' /%3e%3c/svg%3e\")",
        );

        setTimeout(() => {
            pre.style.removeProperty("--copy-icon");
        }, 2000);
    } catch (err) {
        console.error("copy failed:", err);
    }
}

function animate(): void {
    const animateElements = document.querySelectorAll(".animate:not(.show)");

    animateElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add("show");
        }, index * 150);
    });
}

function onScroll(): void {
    document.documentElement.classList.toggle("scrolled", window.scrollY > 0);
}

function scrollToTop(): void {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
}

function toggleTheme(dark: boolean): void {
    const css = document.createElement("style");

    css.appendChild(
        document.createTextNode(
            `* {
             -webkit-transition: none !important;
             -moz-transition: none !important;
             -o-transition: none !important;
             -ms-transition: none !important;
             transition: none !important;
          }
        `,
        ),
    );

    document.head.appendChild(css);
    document.documentElement.classList.toggle("dark", dark);
    void window.getComputedStyle(css).opacity;
    document.head.removeChild(css);
}

function getStoredTheme(): Theme {
    const userTheme = localStorage.getItem("theme");
    return userTheme === "light" || userTheme === "dark" ? userTheme : "system";
}

function getNextTheme(dark: boolean): Exclude<Theme, "system"> {
    return dark ? "light" : "dark";
}

function resolveTheme(theme: Theme, systemPrefersDark = colorSchemeMediaQuery.matches): boolean {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return systemPrefersDark;
}

function updateThemeToggle(dark: boolean): void {
    const themeToggle = document.getElementById("theme-toggle");
    if (!(themeToggle instanceof HTMLElement)) return;

    const nextTheme = getNextTheme(dark);
    const nextLabel = themeLabels[nextTheme];

    themeToggle.dataset.themeToggleMode = nextTheme;
    themeToggle.setAttribute("aria-label", `Switch theme to ${nextLabel}`);
}

function syncTheme(
    theme: Theme = getStoredTheme(),
    systemPrefersDark = colorSchemeMediaQuery.matches,
): void {
    const dark = resolveTheme(theme, systemPrefersDark);
    document.documentElement.dataset.themeMode = theme;
    toggleTheme(dark);
    updateThemeToggle(dark);
}

function bindInitListeners(): void {
    if (siteState.initBound) return;
    siteState.initBound = true;
    document.addEventListener("DOMContentLoaded", init);
    document.addEventListener("astro:after-swap", init);
}

bindOnce();
bindInitListeners();

if (document.readyState !== "loading") {
    init();
}

export {};
