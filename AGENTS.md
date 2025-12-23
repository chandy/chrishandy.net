# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog built with Astro using the AstroPaper theme. It's a static site featuring blog posts written in Markdown with full TypeScript support and TailwindCSS styling.

**Live Site**: https://chrishandy.net

## Essential Commands

```bash
# Development
pnpm install              # Install dependencies
pnpm run dev              # Start dev server at localhost:4321

# Building
pnpm run build           # Type check, build site, generate pagefind index, copy to public/
pnpm run preview         # Preview production build locally

# Code Quality
pnpm run lint            # Run ESLint
pnpm run format          # Format code with Prettier
pnpm run format:check    # Check formatting without modifying

# Utilities
pnpm run sync            # Generate TypeScript types for Astro modules
```

## Architecture

### Content System

The blog uses Astro's Content Collections v4 with the new file system loader:

- **Blog posts**: Located in `src/data/blog/` as Markdown files
- **Collection schema**: Defined in `src/content.config.ts` using Zod
- **Post filtering**: `postFilter` utility filters out drafts and scheduled posts
- **Sorting**: Posts sorted by `modDatetime` (if present) or `pubDatetime`

Key post frontmatter fields:
- `title`, `description`, `pubDatetime` (required)
- `modDatetime`, `featured`, `draft`, `tags` (optional)
- `ogImage`, `canonicalURL`, `hideEditPost`, `timezone` (optional)

### Configuration

- **Site config**: `src/config.ts` - Main site metadata, author info, timezone
- **Constants**: `src/constants.ts` - Social links and share button configurations
- **TypeScript paths**: `@/*` maps to `src/*` for cleaner imports
- **Environment variables**: `PUBLIC_GOOGLE_SITE_VERIFICATION` for Google site verification

### Routing & Pages

Astro file-based routing with dynamic routes:
- `/` - Homepage (`src/pages/index.astro`)
- `/posts/[...page]` - Paginated blog listing
- `/posts/[...slug]` - Individual blog post pages
- `/tags/` - Tag index
- `/tags/[tag]/[...page]` - Posts filtered by tag with pagination
- `/archives` - All posts archive view
- `/search` - Client-side search using Pagefind
- `/about` - About page (`src/pages/about.md`)

### Layouts

Four main layouts in `src/layouts/`:
- `Layout.astro` - Base layout with SEO, theme toggle, and meta tags
- `Main.astro` - Main content wrapper
- `PostDetails.astro` - Blog post detail layout
- `AboutLayout.astro` - About page layout

### Components

Reusable Astro components in `src/components/`:
- `Header.astro` - Site header with navigation
- `Footer.astro` - Site footer
- `Card.astro` - Blog post card for listings
- `Datetime.astro` - Formatted datetime display
- `Tag.astro` - Tag badge component
- `Pagination.astro` - Pagination controls
- `Breadcrumb.astro` - Breadcrumb navigation
- `ShareLinks.astro` - Social sharing buttons
- `Socials.astro` - Social media links
- `BackButton.astro`, `BackToTopButton.astro` - Navigation helpers

### Utilities (`src/utils/`)

- `getSortedPosts.ts` - Sort posts by date
- `postFilter.ts` - Filter drafts and scheduled posts
- `getPostsByTag.ts` - Filter posts by tag
- `getUniqueTags.ts` - Extract unique tags from posts
- `slugify.ts` - Convert strings to URL-friendly slugs
- `generateOgImages.ts` - Dynamic OG image generation using Satori
- `loadGoogleFont.ts` - Font loading for OG images
- `getPath.ts` - Path utilities
- `transformers/fileName.ts` - Custom Shiki transformer for filename display

### Styling

- **Framework**: TailwindCSS v4 via Vite plugin
- **Global styles**: `src/styles/global.css`
- **Typography**: `src/styles/typography.css` with @tailwindcss/typography
- **Theme**: Light/dark mode toggle via `public/toggle-theme.js` script
- **Shiki themes**: `min-light` for light mode, `night-owl` for dark mode

### Build Process

The build command runs multiple steps:
1. `astro check` - TypeScript type checking
2. `astro build` - Build static site to `dist/`
3. `pagefind --site dist` - Generate search index
4. `cp -r dist/pagefind public/` - Copy search index to public

### Search

Uses Pagefind for static site search:
- Search index auto-generated during build
- Client-side search via `/search` page
- No external dependencies or API calls required

### Code Quality Tools

- **ESLint**: TypeScript and Astro linting with `no-console` rule enforced
- **Prettier**: Code formatting with Astro and TailwindCSS plugins
- **TypeScript**: Strict mode enabled via `astro/tsconfigs/strict`

### Dynamic OG Images

Blog posts can have dynamically generated OG images:
- Configured via `dynamicOgImage: true` in `src/config.ts`
- Generated using Satori (React-to-SVG) and resvg-js
- Endpoint at `/og.png.ts` generates images on-the-fly
- Uses Google Fonts loaded via `loadGoogleFont` utility

## Important Notes

- Blog posts use `.md` extension and must start with frontmatter
- Files starting with `_` in `src/data/blog/` are ignored (glob pattern: `**/[^_]*.md`)
- Draft posts (`draft: true`) only visible in development mode
- Scheduled posts require `pubDatetime` to be in the past (with 15-minute margin)
- The site uses IANA timezone format (default: `America/New_York`)
- Static assets go in `public/` directory
- Custom Shiki transformers support filename display, syntax highlighting, and diffs
