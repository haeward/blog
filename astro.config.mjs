import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { remarkSpotifyEmbed } from "./src/lib/remark-spotify-embed.ts";
import remarkImageCaption from "./src/lib/remark-image-caption.ts";


export default defineConfig({
  site: "https://haeward.com",

  integrations: [sitemap(), tailwind(), mdx()],

  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      themes: {
        light: "min-light",
        dark: "dracula-soft"
      },
      defaultColor: false,
      wrap: true,
    },
    remarkPlugins: [
      remarkSpotifyEmbed,
      remarkImageCaption,
    ]
  },

  output: "static",
});
