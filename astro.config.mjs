import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { remarkSpotifyEmbed } from "./src/lib/remark-spotify-embed.js";

import react from "@astrojs/react";

export default defineConfig({
  site: "https://haeward.com",

  integrations: [sitemap(), tailwind(), react(),
    mdx()
  ],

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
    ]
  },

  output: "static",
});
