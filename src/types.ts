export type Site = {
    NAME: string;
    DESC: string;
    NUM_POSTS_ON_HOMEPAGE: number;
};

export type Metadata = {
    TITLE: string;
    DESCRIPTION: string;
};

export type LinkCategory = "blogroll" | "videos" | "podcasts";
export type LinkStatus = "up" | "limited" | "down";

export type LinkEntry = {
    category: LinkCategory;
    title: string;
    url: string;
    platform?: string;
    image?: string;
    status?: LinkStatus;
    checkedAt?: string;
    httpCode?: number;
    reason?: string;
    failCount?: number;
};

export type LinkGeneratedEntry = {
    image?: string;
    status?: LinkStatus;
    checkedAt?: string;
    httpCode?: number;
    reason?: string;
    failCount?: number;
};

export type LinkGeneratedMap = Record<string, LinkGeneratedEntry>;

export type Social = {
    NAME: string;
    HREF: string;
    ICON: string;
    ENABLE?: boolean;
};

export type Socials = Social[];
