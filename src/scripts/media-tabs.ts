import { MEDIA_CARD_CLASSES, MEDIA_CARD_TITLE_CLAMP, renderMediaStars } from "@lib/media-card";
import { escapeAttribute, escapeHtml } from "./html";

type MediaTabData = Record<string, ClientMediaItem[]>;

type ClientMediaItem = {
    title?: string;
    url?: string;
    cover?: string;
    myRating?: number;
};

type ActivateOptions = {
    updateHash: boolean;
};

function initMediaTabs(): void {
    const tablist = document.getElementById("media-tabs");
    const dataNode = document.getElementById("media-data");
    if (!tablist || !dataNode) return;
    if (tablist.dataset.bound === "true") return;
    tablist.dataset.bound = "true";

    const tabs = Array.from(tablist.querySelectorAll("[data-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-tab-panel]"));
    if (!tabs.length || !panels.length) return;

    const tabNames = tabs.map((tab) => tab.getAttribute("data-tab")).filter(Boolean);
    const tabSet = new Set(tabNames);
    const tabData = JSON.parse(dataNode.textContent || "{}") as MediaTabData;
    const pageSize = Number.parseInt(dataNode.dataset.pageSize || "100", 10);
    const defaultTab = "movies";
    const loadedCounts = Object.fromEntries(
        tabNames.map((name) => [
            name,
            name === defaultTab ? Math.min(pageSize, tabData[name]?.length ?? 0) : 0,
        ]),
    );

    const renderCard = (item: ClientMediaItem): string => {
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
    };

    const updatePanelMeta = (panel: Element, loadedCount: number, totalCount: number) => {
        const moreWrapper = panel.querySelector("[data-media-more-wrapper]");

        if (moreWrapper instanceof HTMLElement) {
            moreWrapper.hidden = loadedCount >= totalCount;
        }
    };

    const renderPanel = (name: string) => {
        const panel = document.querySelector(`[data-tab-panel="${name}"]`);
        if (!(panel instanceof HTMLElement)) return;

        const items = tabData[name] ?? [];
        const loadedCount = loadedCounts[name] ?? 0;
        const grid = panel.querySelector("[data-media-grid]");

        if (grid instanceof HTMLElement) {
            grid.innerHTML = items.slice(0, loadedCount).map(renderCard).join("");
        }

        updatePanelMeta(panel, loadedCount, items.length);
    };

    const appendToPanel = (name: string, startIndex: number, endIndex: number) => {
        const panel = document.querySelector(`[data-tab-panel="${name}"]`);
        if (!(panel instanceof HTMLElement)) return;

        const items = tabData[name] ?? [];
        const grid = panel.querySelector("[data-media-grid]");
        if (grid instanceof HTMLElement) {
            grid.insertAdjacentHTML(
                "beforeend",
                items.slice(startIndex, endIndex).map(renderCard).join(""),
            );
        }

        updatePanelMeta(panel, endIndex, items.length);
    };

    const clearInactivePanels = (activeName: string) => {
        panels.forEach((panel) => {
            const panelName = panel.getAttribute("data-tab-panel");
            if (!panelName || panelName === activeName) return;

            const grid = panel.querySelector("[data-media-grid]");
            if (grid instanceof HTMLElement) {
                grid.innerHTML = "";
            }
        });
    };

    const activate = (name: string, options: ActivateOptions = { updateHash: false }) => {
        tabs.forEach((tab) => {
            const active = tab.getAttribute("data-tab") === name;
            tab.setAttribute("aria-selected", active ? "true" : "false");
            tab.setAttribute("data-active", active ? "true" : "false");
        });

        panels.forEach((panel) => {
            const active = panel.getAttribute("data-tab-panel") === name;
            panel.toggleAttribute("hidden", !active);
        });

        if ((loadedCounts[name] ?? 0) === 0) {
            loadedCounts[name] = Math.min(pageSize, tabData[name]?.length ?? 0);
        }

        clearInactivePanels(name);
        renderPanel(name);

        if (options.updateHash) {
            const nextHash = `#${name}`;
            if (window.location.hash !== nextHash) {
                history.replaceState(null, "", nextHash);
            }
        }
    };

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const name = tab.getAttribute("data-tab");
            if (!name) return;
            activate(name, { updateHash: true });
        });
    });

    panels.forEach((panel) => {
        const name = panel.getAttribute("data-tab-panel");
        const moreButton = panel.querySelector("[data-media-more]");
        if (!name || !(moreButton instanceof HTMLButtonElement)) return;

        moreButton.addEventListener("click", () => {
            const items = tabData[name] ?? [];
            const currentCount = loadedCounts[name] ?? 0;
            const nextCount = Math.min(currentCount + pageSize, items.length);
            if (nextCount === currentCount) return;

            loadedCounts[name] = nextCount;
            appendToPanel(name, currentCount, nextCount);
        });
    });

    const syncFromHash = () => {
        const requested = window.location.hash.replace(/^#/, "");
        const fallback = tabSet.has(defaultTab) ? defaultTab : tabNames[0];
        if (!fallback) return;

        activate(tabSet.has(requested) ? requested : fallback, { updateHash: false });
    };

    window.addEventListener("hashchange", syncFromHash);
    syncFromHash();
}

document.addEventListener("DOMContentLoaded", initMediaTabs);
document.addEventListener("astro:page-load", initMediaTabs);
