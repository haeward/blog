import { MEDIA_CARD_CLASSES, MEDIA_CARD_TITLE_CLAMP, renderMediaStars } from "@lib/media-card";
import { escapeAttribute, escapeHtml } from "./html";

type MediaTabKey = "movies" | "series" | "anime" | "books";

type ClientMediaItem = {
    title?: string;
    url?: string;
    cover?: string;
    myRating?: number;
};

type MediaManifest = {
    defaultTab: MediaTabKey;
    pageSize: number;
    endpointBase: string;
    tabs: Record<MediaTabKey, { count: number }>;
};

type MediaDataPage = {
    tab: MediaTabKey;
    page: number;
    pageSize: number;
    totalCount: number;
    hasMore: boolean;
    items: ClientMediaItem[];
};

type PanelRefs = {
    panel: HTMLElement;
    grid: HTMLElement | null;
    sentinel: HTMLElement | null;
    statusWrapper: HTMLElement | null;
    statusMessage: HTMLElement | null;
    retryWrapper: HTMLElement | null;
    retryButton: HTMLButtonElement | null;
};

type TabState = {
    html: string;
    loadedPages: Set<number>;
    loadedCount: number;
    totalCount: number;
    hasMore: boolean;
    loadingScope: "initial" | "more" | null;
    blockedOnError: boolean;
};

type MediaContext = {
    activeTab: MediaTabKey | null;
    manifest: MediaManifest;
    panels: Record<MediaTabKey, PanelRefs>;
    tabNames: MediaTabKey[];
    tabSet: Set<MediaTabKey>;
    tabs: HTMLButtonElement[];
    tabStates: Record<MediaTabKey, TabState>;
};

type GlobalMediaTabsState = {
    hashBound: boolean;
    pendingRequests: Map<string, Promise<MediaDataPage>>;
    retryActions: Map<MediaTabKey, (() => void) | null>;
    syncFromHash: (() => void) | null;
    activeObserver: IntersectionObserver | null;
};

type MediaTabsWindow = Window & {
    __mediaTabsState?: GlobalMediaTabsState;
};

const globalWindow = window as MediaTabsWindow;
globalWindow.__mediaTabsState ??= {
    hashBound: false,
    pendingRequests: new Map(),
    retryActions: new Map(),
    syncFromHash: null,
    activeObserver: null,
};

const mediaTabsState = globalWindow.__mediaTabsState;

function initMediaTabs(): void {
    const tablist = document.getElementById("media-tabs");
    const dataNode = document.getElementById("media-data");
    if (!(tablist instanceof HTMLElement) || !(dataNode instanceof HTMLScriptElement)) {
        mediaTabsState.syncFromHash = null;
        return;
    }
    if (tablist.dataset.bound === "true") return;
    tablist.dataset.bound = "true";

    const manifest = parseManifest(dataNode.textContent || "{}");
    if (!manifest) return;

    const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>("[data-tab]"));
    const tabNames = tabs
        .map((tab) => tab.getAttribute("data-tab"))
        .filter((name): name is MediaTabKey => Boolean(name) && isMediaTabKey(name));
    if (!tabNames.length) return;

    const panels = Object.fromEntries(tabNames.map((name) => [name, getPanelRefs(name)])) as Record<
        MediaTabKey,
        PanelRefs
    >;

    const tabStates = Object.fromEntries(
        tabNames.map((name) => {
            const refs = panels[name];
            const totalCount = manifest.tabs[name]?.count ?? 0;
            const initialLoadedCount =
                name === manifest.defaultTab && refs.grid
                    ? refs.grid.querySelectorAll(":scope > li").length
                    : 0;

            return [
                name,
                {
                    html: name === manifest.defaultTab && refs.grid ? refs.grid.innerHTML : "",
                    loadedPages: new Set<number>(initialLoadedCount > 0 ? [1] : []),
                    loadedCount: initialLoadedCount,
                    totalCount,
                    hasMore: initialLoadedCount < totalCount,
                    loadingScope: null,
                    blockedOnError: false,
                } satisfies TabState,
            ];
        }),
    ) as Record<MediaTabKey, TabState>;

    const context: MediaContext = {
        activeTab: null,
        manifest,
        panels,
        tabNames,
        tabSet: new Set(tabNames),
        tabs,
        tabStates,
    };

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const name = tab.getAttribute("data-tab");
            if (!name || !isMediaTabKey(name)) return;
            void activateTab(context, name, { updateHash: true });
        });
    });

    tabNames.forEach((name) => {
        const refs = panels[name];

        refs.retryButton?.addEventListener("click", () => {
            mediaTabsState.retryActions.get(name)?.();
        });
    });

    mediaTabsState.syncFromHash = () => {
        const requested = window.location.hash.replace(/^#/, "");
        const fallback = context.tabSet.has(context.manifest.defaultTab)
            ? context.manifest.defaultTab
            : context.tabNames[0];

        if (!fallback) return;

        const nextTab =
            isMediaTabKey(requested) && context.tabSet.has(requested) ? requested : fallback;
        void activateTab(context, nextTab, { updateHash: false });
    };

    bindHashListener();
    mediaTabsState.syncFromHash();
}

function bindHashListener(): void {
    if (mediaTabsState.hashBound) return;
    mediaTabsState.hashBound = true;
    window.addEventListener("hashchange", () => {
        mediaTabsState.syncFromHash?.();
    });
}

function parseManifest(value: string): MediaManifest | null {
    try {
        const parsed = JSON.parse(value) as Partial<MediaManifest>;

        if (
            !parsed ||
            !isMediaTabKey(parsed.defaultTab) ||
            typeof parsed.pageSize !== "number" ||
            typeof parsed.endpointBase !== "string" ||
            !parsed.tabs
        ) {
            return null;
        }

        return {
            defaultTab: parsed.defaultTab,
            pageSize: parsed.pageSize,
            endpointBase: parsed.endpointBase,
            tabs: {
                movies: { count: Number(parsed.tabs.movies?.count ?? 0) },
                series: { count: Number(parsed.tabs.series?.count ?? 0) },
                anime: { count: Number(parsed.tabs.anime?.count ?? 0) },
                books: { count: Number(parsed.tabs.books?.count ?? 0) },
            },
        };
    } catch {
        return null;
    }
}

function getPanelRefs(name: MediaTabKey): PanelRefs {
    const panel = document.querySelector(`[data-tab-panel="${name}"]`);

    if (!(panel instanceof HTMLElement)) {
        return {
            panel: document.createElement("section"),
            grid: null,
            sentinel: null,
            statusWrapper: null,
            statusMessage: null,
            retryWrapper: null,
            retryButton: null,
        };
    }

    return {
        panel,
        grid: panel.querySelector("[data-media-grid]"),
        sentinel: panel.querySelector("[data-media-sentinel]"),
        statusWrapper: panel.querySelector("[data-media-status-wrapper]"),
        statusMessage: panel.querySelector("[data-media-status-message]"),
        retryWrapper: panel.querySelector("[data-media-retry-wrapper]"),
        retryButton: panel.querySelector("[data-media-retry]"),
    };
}

function isMediaTabKey(value: unknown): value is MediaTabKey {
    return value === "movies" || value === "series" || value === "anime" || value === "books";
}

function buildEndpoint(context: MediaContext, tab: MediaTabKey, page: number): string {
    return `${context.manifest.endpointBase}/${tab}/${page}.json`;
}

function getNextPage(context: MediaContext, tab: MediaTabKey): number {
    return Math.floor(context.tabStates[tab].loadedCount / context.manifest.pageSize) + 1;
}

function renderCard(item: ClientMediaItem): string {
    const title = escapeHtml(item.title || "Untitled");
    const stars = Math.max(0, Math.min(5, Math.round(item.myRating || 0)));
    const cover = item.cover
        ? `<img src="${escapeAttribute(item.cover)}" alt="${title}" loading="lazy" decoding="async" fetchpriority="low" width="240" height="360" class="${MEDIA_CARD_CLASSES.coverImage}" />`
        : `<div class="${MEDIA_CARD_CLASSES.missingCover}">No cover</div>`;
    const body = `<div class="flex h-full flex-col">
                    <div class="${MEDIA_CARD_CLASSES.coverShell}">
                      ${cover}
                    </div>
                    <div class="${MEDIA_CARD_CLASSES.content}">
                      <div class="${MEDIA_CARD_CLASSES.title}" style="${MEDIA_CARD_TITLE_CLAMP}">
                        ${title}
                      </div>
                      <div class="${MEDIA_CARD_CLASSES.stars}">
                        ${renderMediaStars(stars)}
                        <span class="sr-only">${stars} out of 5</span>
                      </div>
                    </div>
                  </div>`;

    if (item.url) {
        return `<li class="group h-full">
                <a href="${escapeAttribute(item.url)}" target="_blank" rel="noopener noreferrer" class="${MEDIA_CARD_CLASSES.linked}">
                  ${body}
                </a>
              </li>`;
    }

    return `<li class="group h-full">
              <div class="${MEDIA_CARD_CLASSES.static}">
                ${body}
              </div>
            </li>`;
}

function renderPanel(context: MediaContext, tab: MediaTabKey): void {
    const refs = context.panels[tab];
    const state = context.tabStates[tab];

    if (refs.grid) {
        refs.grid.innerHTML = state.html;
    }

    updateSentinelState(context, tab);
}

function clearInactivePanels(context: MediaContext, activeTab: MediaTabKey): void {
    context.tabNames.forEach((name) => {
        if (name === activeTab) return;

        const refs = context.panels[name];
        if (refs.grid) {
            refs.grid.innerHTML = "";
        }
    });
}

function updateSentinelState(context: MediaContext, tab: MediaTabKey): void {
    const refs = context.panels[tab];
    const state = context.tabStates[tab];
    if (!refs.sentinel) return;

    refs.sentinel.hidden = !state.hasMore;
}

function setLoadingState(context: MediaContext, tab: MediaTabKey, scope: "initial" | "more"): void {
    const refs = context.panels[tab];
    const state = context.tabStates[tab];

    if (refs.statusWrapper && refs.statusMessage && refs.retryWrapper) {
        refs.statusWrapper.hidden = false;
        refs.statusMessage.textContent = "Loading…";
        refs.retryWrapper.hidden = true;
    }

    state.loadingScope = scope;
    state.blockedOnError = false;
    disconnectAutoLoadObserver();

    mediaTabsState.retryActions.set(tab, null);
}

function clearStatus(context: MediaContext, tab: MediaTabKey): void {
    const refs = context.panels[tab];
    const state = context.tabStates[tab];

    if (refs.statusWrapper && refs.retryWrapper) {
        refs.statusWrapper.hidden = true;
        refs.retryWrapper.hidden = true;
    }

    state.loadingScope = null;
    state.blockedOnError = false;
    mediaTabsState.retryActions.set(tab, null);
}

function setErrorState(
    context: MediaContext,
    tab: MediaTabKey,
    _scope: "initial" | "more",
    message: string,
    retryAction: () => void,
): void {
    const refs = context.panels[tab];
    const state = context.tabStates[tab];

    if (refs.statusWrapper && refs.statusMessage && refs.retryWrapper) {
        refs.statusWrapper.hidden = false;
        refs.statusMessage.textContent = message;
        refs.retryWrapper.hidden = false;
    }

    state.loadingScope = null;
    state.blockedOnError = true;
    disconnectAutoLoadObserver();
    mediaTabsState.retryActions.set(tab, retryAction);
}

function disconnectAutoLoadObserver(): void {
    mediaTabsState.activeObserver?.disconnect();
    mediaTabsState.activeObserver = null;
}

function observeAutoLoad(context: MediaContext, tab: MediaTabKey): void {
    disconnectAutoLoadObserver();

    const state = context.tabStates[tab];
    const refs = context.panels[tab];
    if (!refs.sentinel || !state.hasMore || state.loadingScope || state.blockedOnError) {
        return;
    }

    if (typeof IntersectionObserver !== "function") {
        return;
    }

    mediaTabsState.activeObserver = new IntersectionObserver(
        (entries) => {
            const entry = entries[0];
            if (!entry?.isIntersecting || context.activeTab !== tab) return;

            disconnectAutoLoadObserver();
            void loadMore(context, tab);
        },
        {
            root: null,
            rootMargin: "0px 0px 600px 0px",
            threshold: 0,
        },
    );

    mediaTabsState.activeObserver.observe(refs.sentinel);
}

async function fetchMediaPage(
    context: MediaContext,
    tab: MediaTabKey,
    page: number,
): Promise<MediaDataPage> {
    const requestKey = `${tab}:${page}`;
    const existing = mediaTabsState.pendingRequests.get(requestKey);
    if (existing) return existing;

    const request = (async () => {
        const response = await fetch(buildEndpoint(context, tab, page), {
            headers: { Accept: "application/json" },
        });

        if (!response.ok) {
            throw new Error(`media_page_${response.status}`);
        }

        const payload = (await response.json()) as Partial<MediaDataPage>;

        if (
            !payload ||
            !isMediaTabKey(payload.tab) ||
            payload.tab !== tab ||
            typeof payload.page !== "number" ||
            typeof payload.pageSize !== "number" ||
            typeof payload.totalCount !== "number" ||
            typeof payload.hasMore !== "boolean" ||
            !Array.isArray(payload.items)
        ) {
            throw new Error("media_payload_invalid");
        }

        return {
            tab: payload.tab,
            page: payload.page,
            pageSize: payload.pageSize,
            totalCount: payload.totalCount,
            hasMore: payload.hasMore,
            items: payload.items,
        };
    })();

    mediaTabsState.pendingRequests.set(requestKey, request);

    try {
        return await request;
    } finally {
        mediaTabsState.pendingRequests.delete(requestKey);
    }
}

function applyPayload(
    context: MediaContext,
    tab: MediaTabKey,
    payload: MediaDataPage,
    mode: "replace" | "append",
): void {
    const state = context.tabStates[tab];
    if (state.loadedPages.has(payload.page)) return;

    const html = payload.items.map(renderCard).join("");
    state.html = mode === "append" ? `${state.html}${html}` : html;
    state.loadedPages.add(payload.page);
    state.loadedCount += payload.items.length;
    state.totalCount = payload.totalCount;
    state.hasMore = payload.hasMore;
}

async function loadInitial(context: MediaContext, tab: MediaTabKey): Promise<void> {
    const state = context.tabStates[tab];
    if (state.loadedCount > 0 || state.totalCount === 0) {
        renderPanel(context, tab);
        clearStatus(context, tab);
        if (context.activeTab === tab) {
            observeAutoLoad(context, tab);
        }
        return;
    }

    setLoadingState(context, tab, "initial");

    try {
        const payload = await fetchMediaPage(context, tab, 1);
        applyPayload(context, tab, payload, "replace");
        clearStatus(context, tab);
        renderPanel(context, tab);
        if (context.activeTab === tab) {
            observeAutoLoad(context, tab);
        }
    } catch {
        setErrorState(context, tab, "initial", "Could not load this tab right now.", () => {
            void loadInitial(context, tab);
        });
    }
}

async function loadMore(context: MediaContext, tab: MediaTabKey): Promise<void> {
    const state = context.tabStates[tab];
    if (!state.hasMore) return;

    const nextPage = getNextPage(context, tab);
    if (state.loadedPages.has(nextPage)) return;

    setLoadingState(context, tab, "more");

    try {
        const payload = await fetchMediaPage(context, tab, nextPage);
        applyPayload(context, tab, payload, "append");
        clearStatus(context, tab);
        renderPanel(context, tab);
        if (context.activeTab === tab) {
            observeAutoLoad(context, tab);
        }
    } catch {
        setErrorState(context, tab, "more", "Could not load more items right now.", () => {
            void loadMore(context, tab);
        });
    }
}

async function activateTab(
    context: MediaContext,
    tab: MediaTabKey,
    options: { updateHash: boolean },
): Promise<void> {
    disconnectAutoLoadObserver();
    context.activeTab = tab;

    context.tabs.forEach((button) => {
        const active = button.getAttribute("data-tab") === tab;
        button.setAttribute("aria-selected", active ? "true" : "false");
        button.setAttribute("data-active", active ? "true" : "false");
    });

    context.tabNames.forEach((name) => {
        context.panels[name].panel.toggleAttribute("hidden", name !== tab);
    });

    clearInactivePanels(context, tab);

    if (options.updateHash) {
        const nextHash = `#${tab}`;
        if (window.location.hash !== nextHash) {
            history.replaceState(null, "", nextHash);
        }
    }

    if (context.tabStates[tab].loadedCount === 0 && context.tabStates[tab].totalCount > 0) {
        await loadInitial(context, tab);
        return;
    }

    renderPanel(context, tab);
    observeAutoLoad(context, tab);
}

document.addEventListener("DOMContentLoaded", initMediaTabs);
document.addEventListener("astro:page-load", initMediaTabs);
