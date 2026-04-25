export type ChangelogEntry = {
    date: string;
    content: string;
};

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
    {
        date: "2026-04-24",
        content: "Add the Now page and ship terminal-style share previews",
    },
    {
        date: "2026-04-21",
        content: "Add the Links page and article share previews",
    },
    {
        date: "2026-04-20",
        content:
            "Add the changelog page, a custom search modal with Pagefind, and a browser-friendly RSS view",
    },
    {
        date: "2026-04-19",
        content: "Refresh the site typography",
    },
    {
        date: "2026-03-13",
        content: "Add an article table of contents",
    },
    {
        date: "2026-02-02",
        content: "Add the Media page with Douban-powered shelf sync",
    },
    {
        date: "2026-01-29",
        content: "Add an image lightbox for article photos",
    },
    {
        date: "2025-07-24",
        content: "Launch the site",
    },
];
