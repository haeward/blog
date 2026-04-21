import type { LinkEntry, LinkGeneratedMap } from "@types";
import linkGenerated from "./generated.json";
import linkSource from "./links.json";

type LinkSource = {
    blogroll: Array<Omit<LinkEntry, "image" | "status" | "checkedAt">>;
    videos: Array<Omit<LinkEntry, "image" | "status" | "checkedAt">>;
};

const source = linkSource as LinkSource;
const generated = linkGenerated as LinkGeneratedMap;

function enrichLinks(
    items: Array<Omit<LinkEntry, "image" | "status" | "checkedAt">>,
    options: { includeStatus: boolean },
): LinkEntry[] {
    return items.map((item) => {
        const data = generated[item.url];
        const status = options.includeStatus ? data?.status : undefined;
        const checkedAt = options.includeStatus ? data?.checkedAt : undefined;

        return {
            ...item,
            image: data?.image,
            status,
            checkedAt,
        };
    });
}

export const BLOGROLL_LINKS: LinkEntry[] = enrichLinks(source.blogroll, { includeStatus: true });
export const VIDEO_LINKS: LinkEntry[] = enrichLinks(source.videos, { includeStatus: false });
