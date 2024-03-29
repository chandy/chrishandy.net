import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import vue from "@astrojs/vue";
import htmx from "astro-htmx";
import node from "@astrojs/node";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  // output: "server",
  // adapter: node({
  //   mode: "standalone",
  // }),
  integrations: [tailwind(), mdx(), vue(), htmx()],
  output: "hybrid",
  adapter: vercel()
});