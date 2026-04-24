import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;
export type BlogPostGroups = Record<string, BlogPost[]>;

export function sortPostsByDate(posts: BlogPost[]): BlogPost[] {
    return [...posts].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
    const posts = await getCollection("blog");

    return sortPostsByDate(posts.filter((post) => !post.data.draft));
}

export async function getRecentPosts(limit: number): Promise<BlogPost[]> {
    return (await getPublishedPosts()).slice(0, limit);
}

export function groupPostsByYear(posts: BlogPost[]): BlogPostGroups {
    return posts.reduce<BlogPostGroups>((groups, post) => {
        const year = post.data.date.getFullYear().toString();
        groups[year] ??= [];
        groups[year].push(post);
        return groups;
    }, {});
}

export function getPostNeighbors(posts: BlogPost[], post: BlogPost) {
    const index = posts.findIndex((item) => item.id === post.id);

    return {
        prev: index > 0 ? posts[index - 1] : null,
        next: index >= 0 && index < posts.length - 1 ? posts[index + 1] : null,
    };
}
