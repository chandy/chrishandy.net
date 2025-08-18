# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

All commands are run from the project root using pnpm:

- `pnpm dev` - Start development server at localhost:4321
- `pnpm build` - Build production site to ./dist/
- `pnpm preview` - Preview build locally before deploying
- `pnpm astro ...` - Run Astro CLI commands (add, check, etc.)

## Architecture Overview

This is Chris Handy's personal website built with **Astro 5** and deployed to **Vercel**. The site follows Astro's file-based routing system and uses static generation with minimal client-side JavaScript.

### Tech Stack

- **Astro 5** - Static site generator with partial hydration
- **React 19** - For interactive components (minimal usage)
- **Tailwind CSS 4** - Utility-first CSS framework
- **TypeScript** - Type safety throughout
- **MDX** - Markdown with JSX for blog content
- **Vercel** - Deployment platform

### Project Structure

```text
src/
├── components/     # Reusable Astro/React components
├── content/        # Content collections (blog posts)
├── layouts/        # Page layouts (BaseLayout, BlogPost)
├── pages/          # File-based routing
│   ├── blog/       # Blog routes with dynamic [...slug]
│   └── *.astro     # Static pages
└── styles/         # Global CSS
```

### Content Management

- Blog posts are managed through **Astro Content Collections** in `src/content/blog/`
- Uses `content.config.ts` with Zod schema validation
- Supports both `.md` and `.mdx` files with frontmatter
- Dynamic blog routes handled by `[...slug].astro`

### Styling Approach

- **Tailwind CSS 4** with Vite plugin integration
- Scoped styles in Astro components when needed
- Custom Tailwind config with container utilities
- Global styles in `src/styles/global.css`

### Key Configuration Files

- `astro.config.mjs` - Astro configuration with integrations (MDX, sitemap, React, Vercel)
- `tailwind.config.mjs` - Tailwind configuration
- `content.config.ts` - Content collection schemas
- `consts.ts` - Global site constants (SITE_TITLE, SITE_DESCRIPTION)

### Development Guidelines from .cursorrules

- Prioritize static generation with minimal JavaScript
- Use Astro's partial hydration (`client:*` directives) judiciously
- Follow Astro's naming conventions and file-based routing
- Never use `@apply` directive in Tailwind
- Leverage content collections for structured content
- Use TypeScript for type safety
- Implement proper SEO with meta tags and sitemaps
