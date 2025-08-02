import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import embeds from "astro-embed/integration";

import react from "@astrojs/react";

export default defineConfig({
  site: "https://blog.haeward.com",

  integrations: [sitemap(), tailwind(), react(),
    embeds({
      services: {
        LinkPreview: false,
      }
    }),
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
    }
  },

  output: "static",
});
