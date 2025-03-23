// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from "@tailwindcss/vite";
import react from '@astrojs/react';


// https://astro.build/config
export default defineConfig({
  site: 'https://chrishandy.net',
  integrations: [mdx(), sitemap(), react()],
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
});