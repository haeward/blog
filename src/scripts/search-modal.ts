import { escapeAttribute, escapeHtml } from "./html";

type SearchView = "idle" | "loading" | "unavailable" | "empty" | "results";

type SearchResult = {
    title: string;
    date: string;
    href: string;
    excerpt: string;
};

type SearchRefs = {
    root: HTMLElement | null;
    input: HTMLInputElement | null;
    summary: HTMLElement | null;
    content: HTMLElement | null;
    trigger: Element | null;
};

type SearchState = {
    bound: boolean;
    refs: SearchRefs | null;
    open: boolean;
    query: string;
    results: SearchResult[];
    view: SearchView;
    summary: string;
    lastTrigger: Element | null;
    searchToken: number;
    pagefind: PagefindInstance | null;
    pagefindPromise: Promise<PagefindInstance | null> | null;
    missingIndex: boolean;
    mergedLanguages: string[];
};

type PagefindLanguageMap = Record<string, { page_count?: number }>;

type PagefindModule = {
    default?: PagefindInstance | { createInstance?: () => PagefindInstance };
    createInstance?: () => PagefindInstance;
};

type PagefindInstance = {
    init?: () => Promise<void>;
    mergeIndex?: (bundlePath: string, options: { language: string }) => Promise<void>;
    preload?: (term: string) => void;
    debouncedSearch?: (term: string) => Promise<PagefindSearch | null>;
    search: (term: string) => Promise<PagefindSearch | null>;
};

type PagefindSearch = {
    results?: Array<{ data: () => Promise<PagefindEntry> }>;
};

type PagefindEntry = {
    url?: string;
    excerpt?: string;
    meta?: {
        title?: string;
        date?: string;
    };
    sub_results?: Array<{
        url?: string;
        excerpt?: string;
    }>;
};

type SearchWindow = Window & {
    __searchModalState?: SearchState;
};

const globalWindow = window as SearchWindow;
globalWindow.__searchModalState ??= {
    bound: false,
    refs: null,
    open: false,
    query: "",
    results: [],
    view: "idle",
    summary: "",
    lastTrigger: null,
    searchToken: 0,
    pagefind: null,
    pagefindPromise: null,
    missingIndex: false,
    mergedLanguages: [],
};

const searchModalState = globalWindow.__searchModalState;

function clearSuppressedTriggerFocus(): void {
    const trigger = document.querySelector("[data-search-trigger='true']");
    if (trigger instanceof HTMLElement) {
        delete trigger.dataset.suppressFocusRing;
    }
}

function initSearchModal(): void {
    searchModalState.refs = {
        root: document.getElementById("site-search"),
        input: document.getElementById("site-search-input") as HTMLInputElement | null,
        summary: document.getElementById("site-search-summary"),
        content: document.getElementById("site-search-content"),
        trigger: document.querySelector("[data-search-trigger='true']"),
    };

    if (
        !searchModalState.refs.root ||
        !searchModalState.refs.input ||
        !searchModalState.refs.summary ||
        !searchModalState.refs.content
    ) {
        return;
    }

    searchModalState.refs.input.value = searchModalState.query;

    if (searchModalState.open) {
        closeSearch({ restoreFocus: false });
    } else {
        document.documentElement.classList.remove("search-open");
        renderSearchModal();
    }
}

function bindSearchModal(): void {
    if (searchModalState.bound) return;
    searchModalState.bound = true;

    document.addEventListener("click", handleSearchModalClick);
    document.addEventListener("keydown", handleSearchModalKeydown);
    document.addEventListener("input", handleSearchModalInput);
    document.addEventListener("pointerdown", clearSuppressedTriggerFocus, true);
    document.addEventListener("astro:after-swap", initSearchModal);
}

function handleSearchModalClick(event: MouseEvent): void {
    if (!(event.target instanceof Element)) return;

    const trigger = event.target.closest("[data-search-trigger='true']");
    if (trigger) {
        event.preventDefault();
        if (searchModalState.open) {
            closeSearch();
        } else {
            openSearch(trigger);
        }
        return;
    }

    const closeTarget = event.target.closest("[data-search-close='true']");
    if (closeTarget && searchModalState.open) {
        event.preventDefault();
        closeSearch({ restoreFocus: false });
        return;
    }

    const resultLink = event.target.closest("[data-search-result-link='true']");
    if (resultLink && searchModalState.open) {
        closeSearch({ restoreFocus: false });
    }
}

function handleSearchModalKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" && searchModalState.open) {
        event.preventDefault();
        closeSearch();
        return;
    }

    const isShortcut =
        event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey) && !event.altKey;
    if (!isShortcut) return;
    if (isEditableTarget(event.target)) return;

    event.preventDefault();

    if (searchModalState.open) {
        closeSearch();
    } else {
        openSearch(document.querySelector("[data-search-trigger='true']"));
    }
}

function handleSearchModalInput(event: Event): void {
    if (!(event.target instanceof HTMLInputElement) || event.target.id !== "site-search-input") {
        return;
    }

    const term = event.target.value.trim();
    searchModalState.query = term;

    if (!term) {
        searchModalState.searchToken += 1;
        searchModalState.results = [];
        searchModalState.summary = "";
        searchModalState.view = searchModalState.missingIndex ? "unavailable" : "idle";
        renderSearchModal();
        return;
    }

    void searchArticles(term);
}

function openSearch(trigger: Element | null): void {
    const refs = searchModalState.refs;
    if (!refs?.root || !refs.input) return;

    searchModalState.open = true;
    searchModalState.lastTrigger =
        trigger instanceof HTMLElement ? trigger : document.activeElement;
    clearSuppressedTriggerFocus();

    refs.root.hidden = false;
    refs.root.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("search-open");
    refs.input.value = searchModalState.query;
    renderSearchModal();
    refs.input.focus({ preventScroll: true });
    refs.input.select();
    void ensurePagefind();
}

function closeSearch({ restoreFocus = true } = {}): void {
    const refs = searchModalState.refs;
    if (!refs?.root) return;

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement && refs.root.contains(activeElement)) {
        activeElement.blur();
    }

    searchModalState.open = false;
    refs.root.hidden = true;
    refs.root.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("search-open");

    if (restoreFocus && searchModalState.lastTrigger instanceof HTMLElement) {
        searchModalState.lastTrigger.dataset.suppressFocusRing = "true";
        searchModalState.lastTrigger.focus({ preventScroll: true });
    }
}

async function ensurePagefind(): Promise<PagefindInstance | null> {
    if (searchModalState.pagefind) return searchModalState.pagefind;
    if (searchModalState.missingIndex) return null;
    if (searchModalState.pagefindPromise) return searchModalState.pagefindPromise;

    searchModalState.pagefindPromise = (async () => {
        try {
            const pagefindPath = "/pagefind/pagefind.js";
            const imported = (await import(/* @vite-ignore */ pagefindPath)) as PagefindModule;
            const pagefindModule = imported?.default ?? imported;
            const pagefind =
                "createInstance" in pagefindModule &&
                typeof pagefindModule.createInstance === "function"
                    ? pagefindModule.createInstance()
                    : (pagefindModule as PagefindInstance);
            const languages = await loadPagefindLanguages();

            if (typeof pagefind.init === "function") {
                await pagefind.init();
            }

            await mergePagefindLanguages(pagefind, languages);
            searchModalState.pagefind = pagefind;
            return pagefind;
        } catch {
            searchModalState.missingIndex = true;
            if (!searchModalState.query) {
                searchModalState.view = "unavailable";
                renderSearchModal();
            }
            return null;
        } finally {
            searchModalState.pagefindPromise = null;
        }
    })();

    return searchModalState.pagefindPromise;
}

async function loadPagefindLanguages(): Promise<PagefindLanguageMap> {
    const response = await fetch("/pagefind/pagefind-entry.json", {
        headers: { Accept: "application/json" },
    });

    if (!response.ok) {
        throw new Error("Pagefind entry unavailable");
    }

    const entry = (await response.json()) as { languages?: PagefindLanguageMap };
    return entry?.languages && typeof entry.languages === "object" ? entry.languages : {};
}

async function mergePagefindLanguages(
    pagefind: PagefindInstance,
    languages: PagefindLanguageMap,
): Promise<void> {
    if (typeof pagefind.mergeIndex !== "function") return;

    const languageKeys = Object.keys(languages);
    if (languageKeys.length <= 1) {
        searchModalState.mergedLanguages = [];
        return;
    }

    const primaryLanguage = getPrimaryPagefindLanguage(languages);
    const bundlePath = new URL("/pagefind/", window.location.origin).href;
    const languagesToMerge = languageKeys.filter((language) => language !== primaryLanguage);

    await Promise.all(
        languagesToMerge.map((language) => pagefind.mergeIndex?.(bundlePath, { language })),
    );
    searchModalState.mergedLanguages = languagesToMerge;
}

function getPrimaryPagefindLanguage(languages: PagefindLanguageMap): string {
    const languageKeys = Object.keys(languages);
    const pageLanguage = (document.documentElement.getAttribute("lang") || "unknown").toLowerCase();

    if (languages[pageLanguage]) return pageLanguage;

    const baseLanguage = pageLanguage.split("-")[0];
    if (languages[baseLanguage]) return baseLanguage;

    return languageKeys
        .slice()
        .sort(
            (left, right) =>
                (languages[right]?.page_count || 0) - (languages[left]?.page_count || 0),
        )[0];
}

async function searchArticles(term: string): Promise<void> {
    const token = ++searchModalState.searchToken;
    searchModalState.view = "loading";
    searchModalState.summary = "";
    renderSearchModal();

    const pagefind = await ensurePagefind();
    if (!pagefind) {
        if (token !== searchModalState.searchToken) return;
        searchModalState.view = "unavailable";
        searchModalState.summary = "";
        renderSearchModal();
        return;
    }

    if (typeof pagefind.preload === "function") {
        pagefind.preload(term);
    }

    const search =
        typeof pagefind.debouncedSearch === "function"
            ? await pagefind.debouncedSearch(term)
            : await pagefind.search(term);

    if (token !== searchModalState.searchToken || search === null) return;

    const data = await Promise.all(
        (search.results || []).slice(0, 8).map((result) => result.data()),
    );
    if (token !== searchModalState.searchToken) return;

    const items = data.map(normalizeSearchResult).filter((item) => item !== null);

    searchModalState.results = items;
    searchModalState.summary = items.length
        ? `${items.length} result${items.length === 1 ? "" : "s"} for “${term}”`
        : "";
    searchModalState.view = items.length ? "results" : "empty";
    renderSearchModal();
}

function normalizeSearchResult(entry: PagefindEntry): SearchResult | null {
    if (!entry?.url) return null;

    const subResult = Array.isArray(entry.sub_results)
        ? entry.sub_results.find((item) => item?.url)
        : null;
    const excerpt = subResult?.excerpt || entry.excerpt || "";

    return {
        title: entry.meta?.title || "Untitled article",
        date: formatSearchDate(entry.meta?.date),
        href: subResult?.url || entry.url,
        excerpt,
    };
}

function formatSearchDate(value?: string): string {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return value;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function renderSearchModal(): void {
    const refs = searchModalState.refs;
    if (!refs?.root || !refs.summary || !refs.content) return;

    refs.root.dataset.searchState = searchModalState.view;

    if (searchModalState.summary) {
        refs.summary.hidden = false;
        refs.summary.textContent = searchModalState.summary;
    } else {
        refs.summary.hidden = true;
        refs.summary.textContent = "";
    }

    refs.content.innerHTML = getSearchModalContent();
}

function getSearchModalContent(): string {
    if (searchModalState.view === "loading") {
        return `
        <div class="site-search__empty-state">
          <div class="site-search__spinner" aria-hidden="true"></div>
          <p class="site-search__headline">Searching the archive</p>
          <p class="site-search__subline">Loading matching sections and excerpts.</p>
        </div>
      `;
    }

    if (searchModalState.view === "unavailable") {
        return `
        <div class="site-search__empty-state">
          <p class="site-search__headline">Search index unavailable in dev mode</p>
          <p class="site-search__subline">Run <code>pnpm build</code> or <code>pnpm preview</code> to generate the Pagefind index.</p>
        </div>
      `;
    }

    if (searchModalState.view === "empty") {
        return `
        <div class="site-search__empty-state">
          <p class="site-search__headline">No articles matched that search</p>
          <p class="site-search__subline">Try another keyword, title, or shorter phrase.</p>
        </div>
      `;
    }

    if (searchModalState.view === "results") {
        return `
        <ul class="site-search__results-list">
          ${searchModalState.results.map(renderSearchResult).join("")}
        </ul>
      `;
    }

    return `
      <div class="site-search__empty-state">
        <p class="site-search__headline">Type a keyword to start searching</p>
        <p class="site-search__subline">Search posts and jump to matching sections.</p>
      </div>
    `;
}

function renderSearchResult(result: SearchResult): string {
    return `
      <li class="site-search__result">
        <a
          class="site-search__result-link"
          href="${escapeAttribute(result.href)}"
          data-search-result-link="true"
        >
          ${result.date ? `<p class="site-search__result-date">${escapeHtml(result.date)}</p>` : ""}
          <h3 class="site-search__result-title">${escapeHtml(result.title)}</h3>
          <p class="site-search__result-excerpt">${result.excerpt}</p>
        </a>
      </li>
    `;
}

function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

bindSearchModal();
initSearchModal();
