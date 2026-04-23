import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
    NAME: "Haeward",
    DESC: "Haeward's Blog",
    NUM_POSTS_ON_HOMEPAGE: 10,
};

export const BLOG: Metadata = {
    TITLE: "Archive",
    DESCRIPTION: "A chronological archive of articles on topics I am passionate about.",
};

export const NOW: Metadata = {
    TITLE: "Now",
    DESCRIPTION: "What I am focused on right now, plus the latest moments.",
};

export const ABOUT: Metadata = {
    TITLE: "About",
    DESCRIPTION: "Who I am and what I do.",
};

export const MEDIA: Metadata = {
    TITLE: "Media",
    DESCRIPTION: "Completed books, films, and shows I track.",
};

export const LINKS: Metadata = {
    TITLE: "Links",
    DESCRIPTION: "A directory of blogs and video creators I keep returning to.",
};

export const CHANGELOG: Metadata = {
    TITLE: "Changelog",
    DESCRIPTION: "A timeline of major updates to the site.",
};

export const SOCIALS: Socials = [
    {
        NAME: "Github",
        HREF: "https://github.com/haeward",
        ICON: "/assets/icons/social/github.svg",
        ENABLE: true,
    },
    {
        NAME: "Twitter",
        HREF: "https://x.com/haewyu",
        ICON: "/assets/icons/social/twitter.svg",
        ENABLE: true,
    },
    {
        NAME: "Mastodon",
        HREF: "https://mas.to/@haeward",
        ICON: "/assets/icons/social/mastodon.svg",
        ENABLE: true,
    },
    {
        NAME: "Telegram",
        HREF: "https://t.me/haeward_til",
        ICON: "/assets/icons/social/telegram.svg",
        ENABLE: true,
    },
    {
        NAME: "Reddit",
        HREF: "https://www.reddit.com/user/haewardy",
        ICON: "/assets/icons/social/reddit.svg",
        ENABLE: false,
    },
    {
        NAME: "Instagram",
        HREF: "https://instagram.com/haewyu",
        ICON: "/assets/icons/social/instagram.svg",
        ENABLE: false,
    },
    {
        NAME: "YouTube",
        HREF: "https://youtube.com/@haewyu",
        ICON: "/assets/icons/social/youtube.svg",
        ENABLE: false,
    },
    {
        NAME: "Spotify",
        HREF: "https://open.spotify.com/user/31lkcldiugm7ppmax5ghzshgzfhy",
        ICON: "/assets/icons/social/spotify.svg",
        ENABLE: false,
    },
    {
        NAME: "Email",
        HREF: "mailto:me@haeward.com",
        ICON: "/assets/icons/social/email.svg",
        ENABLE: true,
    },
    {
        NAME: "RSS",
        HREF: "/rss.xml",
        ICON: "/assets/icons/social/rss.svg",
        ENABLE: true,
    },
];
