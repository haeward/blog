import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Haeward",
  DESC: "Software Engineer",
  NUM_POSTS_ON_HOMEPAGE: 5,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics I am passionate about.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Where I have worked and what I have done.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "A collection of my projects, with links to repositories and demos.",
};

export const ABOUT: Metadata = {
  TITLE: "About",
  DESCRIPTION: "Who I am and what I do.",
};

export const NOW: Metadata = {
  TITLE: "Now",
  DESCRIPTION: "What I am currently doing.",
};

export const SOCIALS: Socials = [
  { 
    NAME: "Github",
    HREF: "https://github.com/haeward",
    ICON: "/icons/github.svg",
    ENABLE: true
  },
  { 
    NAME: "Twitter",
    HREF: "https://x.com/haewardy",
    ICON: "/icons/twitter.svg",
    ENABLE: true
  },
  { 
    NAME: "Mastodon",
    HREF: "https://m.cmx.im/@haeward",
    ICON: "/icons/mastodon.svg",
    ENABLE: true
  },
  {
    NAME: "Telegram",
    HREF: "https://t.me/haeward",
    ICON: "/icons/telegram.svg",
    ENABLE: true
  },
  {
    NAME: "Reddit",
    HREF: "https://www.reddit.com/user/haewardy",
    ICON: "/icons/reddit.svg",
    ENABLE: false
  },
  {
    NAME: "Instagram",
    HREF: "https://instagram.com/haewardy",
    ICON: "/icons/instagram.svg",
    ENABLE: false
  },
  {
    NAME: "YouTube",
    HREF: "https://youtube.com/@haewy",
    ICON: "/icons/youtube.svg",
    ENABLE: false
  },
  {
    NAME: "Spotify",
    HREF: "https://open.spotify.com/user/31lkcldiugm7ppmax5ghzshgzfhy",
    ICON: "/icons/spotify.svg",
    ENABLE: false
  },
  {
    NAME: "Email",
    HREF: "mailto:haewardy@gmail.com",
    ICON: "/icons/email.svg",
    ENABLE: true
  },
  {
    NAME: "RSS",
    HREF: "/rss.xml",
    ICON: "/icons/rss.svg",
    ENABLE: true
  }
];
