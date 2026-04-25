import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import bookData from "../data/douban/book.json";
import movieData from "../data/douban/movie.json";

type DoubanRating = {
    max?: number;
    value?: number;
    star_count?: number;
    count?: number;
};

type DoubanSubject = {
    title?: string;
    url?: string;
    sharing_url?: string;
    pic?: {
        normal?: string;
        large?: string;
    };
    cover_url?: string;
    card_subtitle?: string;
    rating?: DoubanRating;
    type?: string;
    subtype?: string;
    genres?: string[];
};

type DoubanItem = {
    comment?: string;
    rating?: DoubanRating;
    create_time?: string;
    status?: string;
    is_private?: boolean;
    sharing_url?: string;
    subject?: DoubanSubject;
};

type NormalizedItem = {
    title: string;
    url?: string;
    cover?: string;
    subtitle?: string;
    comment?: string;
    createdAt?: Date;
    myRating?: number;
    subjectType?: string;
    genres?: string[];
};

export type ClientMediaItem = Pick<NormalizedItem, "title" | "url" | "cover" | "myRating">;
export type MediaTabKey = "movies" | "series" | "anime" | "books";
export type MediaTab = {
    key: MediaTabKey;
    label: string;
    count: number;
};
export type MediaDataPage = {
    tab: MediaTabKey;
    page: number;
    pageSize: number;
    totalCount: number;
    hasMore: boolean;
    items: ClientMediaItem[];
};
export type MediaManifest = {
    defaultTab: MediaTabKey;
    pageSize: number;
    endpointBase: string;
    tabs: Record<MediaTabKey, { count: number }>;
};
type MediaKind = "movie" | "book";

export const MEDIA_PAGE_SIZE = 100;
export const DEFAULT_MEDIA_TAB: MediaTabKey = "movies";
export const MEDIA_DATA_ENDPOINT_BASE = "/media/data";

let mediaItemsByTabCache: Record<MediaTabKey, ClientMediaItem[]> | null = null;

export function getMediaPageData() {
    const itemsByTab = getMediaItemsByTab();
    const tabs = getMediaTabs(itemsByTab);

    return {
        tabs,
        defaultItems: itemsByTab[DEFAULT_MEDIA_TAB].slice(0, MEDIA_PAGE_SIZE),
        manifest: createMediaManifest(itemsByTab),
    };
}

export function getMediaItemsByTab(): Record<MediaTabKey, ClientMediaItem[]> {
    if (mediaItemsByTabCache) return mediaItemsByTabCache;

    const movieCoverIndex = createLocalCoverIndex("movie");
    const bookCoverIndex = createLocalCoverIndex("book");
    const movieEntries = normalizeItems(movieData as DoubanItem[], 5, movieCoverIndex);
    const books = normalizeItems(bookData as DoubanItem[], 5, bookCoverIndex);

    const isAnimation = (item: NormalizedItem) => item.genres?.includes("动画") ?? false;
    const movieItems = movieEntries.filter(
        (item) => !isAnimation(item) && item.subjectType !== "tv",
    );
    const seriesItems = movieEntries.filter(
        (item) => !isAnimation(item) && item.subjectType === "tv",
    );
    const animeItems = movieEntries.filter((item) => isAnimation(item));

    mediaItemsByTabCache = {
        movies: movieItems.map(toClientMediaItem),
        series: seriesItems.map(toClientMediaItem),
        anime: animeItems.map(toClientMediaItem),
        books: books.map(toClientMediaItem),
    };

    return mediaItemsByTabCache;
}

export function getMediaTabs(
    itemsByTab: Record<MediaTabKey, ClientMediaItem[]> = getMediaItemsByTab(),
): MediaTab[] {
    return [
        { key: "movies", label: "Movies", count: itemsByTab.movies.length },
        { key: "series", label: "Series", count: itemsByTab.series.length },
        { key: "anime", label: "Anime", count: itemsByTab.anime.length },
        { key: "books", label: "Books", count: itemsByTab.books.length },
    ];
}

export function createMediaManifest(
    itemsByTab: Record<MediaTabKey, ClientMediaItem[]> = getMediaItemsByTab(),
): MediaManifest {
    return {
        defaultTab: DEFAULT_MEDIA_TAB,
        pageSize: MEDIA_PAGE_SIZE,
        endpointBase: MEDIA_DATA_ENDPOINT_BASE,
        tabs: {
            movies: { count: itemsByTab.movies.length },
            series: { count: itemsByTab.series.length },
            anime: { count: itemsByTab.anime.length },
            books: { count: itemsByTab.books.length },
        },
    };
}

export function getMediaPagePayload(
    tab: MediaTabKey,
    page: number,
    itemsByTab: Record<MediaTabKey, ClientMediaItem[]> = getMediaItemsByTab(),
): MediaDataPage {
    const items = itemsByTab[tab];
    const safePage = Math.max(1, page);
    const start = (safePage - 1) * MEDIA_PAGE_SIZE;
    const end = start + MEDIA_PAGE_SIZE;

    return {
        tab,
        page: safePage,
        pageSize: MEDIA_PAGE_SIZE,
        totalCount: items.length,
        hasMore: end < items.length,
        items: items.slice(start, end),
    };
}

export function getMediaDataStaticPaths() {
    const itemsByTab = getMediaItemsByTab();

    return (Object.entries(itemsByTab) as [MediaTabKey, ClientMediaItem[]][]).flatMap(
        ([tab, items]) =>
            Array.from({ length: Math.ceil(items.length / MEDIA_PAGE_SIZE) }, (_, index) => {
                const page = index + 1;

                return {
                    params: { tab, page: String(page) },
                    props: { payload: getMediaPagePayload(tab, page, itemsByTab) },
                };
            }),
    );
}

function parseDate(value?: string): Date | undefined {
    if (!value) return;

    const parsed = new Date(value.replace(" ", "T"));
    if (Number.isNaN(parsed.valueOf())) return;

    return parsed;
}

function formatRating(rating?: DoubanRating, fallbackMax = 5): number | undefined {
    if (!rating || typeof rating.value !== "number") return;

    const max = typeof rating.max === "number" ? rating.max : fallbackMax;
    if (max <= 0) return;

    return Math.max(0, Math.min(rating.value, max));
}

function normalizeItems(
    items: DoubanItem[],
    fallbackMax: number,
    localCoverIndex: Map<string, string>,
): NormalizedItem[] {
    return items
        .filter((item) => item.status === "done" && !item.is_private)
        .sort((a, b) => {
            const aTime = parseDate(a.create_time)?.valueOf() ?? 0;
            const bTime = parseDate(b.create_time)?.valueOf() ?? 0;
            return bTime - aTime;
        })
        .map((item) => {
            const subject = item.subject ?? {};
            const title = subject.title ?? "Untitled";
            const url = subject.url ?? subject.sharing_url ?? item.sharing_url;
            const subjectId = getSubjectId(subject.url ?? subject.sharing_url ?? item.sharing_url);
            const remoteCover = subject.pic?.normal ?? subject.cover_url;

            return {
                title,
                url,
                cover: resolveCover(localCoverIndex, subjectId, remoteCover),
                subtitle: subject.card_subtitle,
                comment: item.comment?.trim() || undefined,
                createdAt: parseDate(item.create_time),
                myRating: formatRating(item.rating, fallbackMax),
                subjectType: subject.subtype ?? subject.type,
                genres: subject.genres ?? [],
            };
        });
}

function toClientMediaItem(item: NormalizedItem): ClientMediaItem {
    return {
        title: item.title,
        url: item.url,
        cover: item.cover,
        myRating: item.myRating,
    };
}

function getSubjectId(value?: string): string | undefined {
    return value?.match(/subject\/(\d+)/)?.[1];
}

function createLocalCoverIndex(kind: MediaKind): Map<string, string> {
    const dir = path.resolve("public", "douban", kind);
    if (!existsSync(dir)) return new Map();

    return new Map(
        readdirSync(dir, { withFileTypes: true })
            .filter((entry) => entry.isFile())
            .map((entry) => [path.parse(entry.name).name, `/douban/${kind}/${entry.name}`]),
    );
}

function resolveCover(
    localCoverIndex: Map<string, string>,
    subjectId?: string,
    remoteCover?: string,
): string | undefined {
    if (!subjectId) return remoteCover;

    return localCoverIndex.get(subjectId) ?? remoteCover;
}
