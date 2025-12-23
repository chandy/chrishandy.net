# CLAUDE.md - AI Assistant Guide

This document provides comprehensive guidance for AI assistants (particularly Claude) working with this codebase. It covers architecture, conventions, workflows, and best practices.

## Project Overview

**Project Name**: chrishandy.net
**Type**: Personal blog and website
**Framework**: Astro 5.x (based on AstroPaper theme)
**Author**: Chris Handy
**Website**: https://chrishandy.net

This is a modern, minimal blog built with Astro featuring:
- Type-safe markdown content
- Static site generation with exceptional performance
- Full-text search via Pagefind
- Dark/light mode support
- RSS feeds and sitemap
- Dynamic OG image generation
- SEO optimization

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Astro** 5.15.9 | Main framework for static site generation |
| **TypeScript** 5.8.3 | Type safety across the codebase |
| **TailwindCSS** 4.1.11 | Utility-first CSS framework |
| **Pagefind** 1.3.0 | Static search functionality |
| **Satori** 0.15.2 | OG image generation |
| **Sharp** 0.34.2 | Image optimization |
| **dayjs** 1.11.13 | Date/time manipulation |
| **Prettier** 3.6.2 | Code formatting |
| **ESLint** 9.30.1 | Linting and code quality |

## Directory Structure

```
/
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
│       ├── claude.yml       # Claude Code integration (@claude trigger)
│       └── claude-code-review.yml  # Automated PR reviews
├── public/
│   ├── assets/             # Static assets
│   ├── pagefind/           # Auto-generated search index (build-time)
│   ├── favicon.svg
│   ├── astropaper-og.jpg   # Default OG image
│   └── toggle-theme.js     # Client-side theme switching
├── src/
│   ├── assets/
│   │   ├── icons/          # SVG icons (Tabler icons)
│   │   └── images/         # Image assets
│   ├── components/         # Reusable Astro components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Card.astro      # Blog post card
│   │   ├── Datetime.astro  # Date display component
│   │   ├── Tag.astro       # Tag component
│   │   └── ...
│   ├── data/
│   │   └── blog/           # **Blog posts live here** (Markdown files)
│   ├── layouts/            # Page layouts
│   │   ├── Layout.astro    # Base layout
│   │   ├── Main.astro      # Main content layout
│   │   ├── PostDetails.astro  # Blog post layout
│   │   └── AboutLayout.astro
│   ├── pages/              # Astro routes (file-based routing)
│   │   ├── index.astro     # Homepage
│   │   ├── posts/[...page].astro  # Paginated blog list
│   │   ├── posts/[...slug]/index.astro  # Individual blog post
│   │   ├── tags/           # Tag pages
│   │   └── archives/       # Archive page
│   ├── styles/             # Global styles
│   │   ├── global.css
│   │   └── typography.css
│   ├── utils/              # Utility functions
│   │   ├── getSortedPosts.ts      # Post sorting logic
│   │   ├── getPostsByTag.ts       # Tag filtering
│   │   ├── slugify.ts             # URL slug generation
│   │   ├── generateOgImages.ts    # OG image creation
│   │   └── og-templates/          # OG image templates
│   ├── config.ts           # **Site configuration (SITE object)**
│   ├── constants.ts        # Social links and constants
│   └── content.config.ts   # **Content schema definitions**
├── astro.config.ts         # Astro configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
└── eslint.config.js        # ESLint configuration
```

## Key Configuration Files

### Site Configuration (`src/config.ts`)

The `SITE` object contains all core site settings:

```typescript
export const SITE = {
  website: "https://chrishandy.net",
  author: "Chris Handy",
  title: "Chris Handy",
  desc: "My words...",
  lightAndDarkMode: true,
  postPerIndex: 4,           // Posts per page on index
  postPerPage: 4,            // Posts per page in pagination
  scheduledPostMargin: 15 * 60 * 1000,  // 15 minutes
  showArchives: true,
  showBackButton: true,
  timezone: "America/New_York",  // IANA timezone
  // ...
}
```

**When to modify**: Update this file when changing site metadata, pagination settings, or timezone.

### Content Schema (`src/content.config.ts`)

Defines the blog post frontmatter schema:

```typescript
const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});
```

**Important**: Files starting with `_` are ignored by the glob pattern.

### TypeScript Configuration (`tsconfig.json`)

- Uses `@/*` path alias for `./src/*` (e.g., `@/config`, `@/utils/slugify`)
- Extends Astro's strict TypeScript config
- Excludes `dist/` and `public/pagefind/`

## Blog Post Conventions

### Creating a New Blog Post

1. **Location**: Create `.md` file in `src/data/blog/`
2. **Naming**: Use descriptive kebab-case names (e.g., `my-awesome-post.md`)
3. **Frontmatter**: Required fields per schema in `content.config.ts`

### Blog Post Frontmatter Template

```markdown
---
author: Chris Handy
pubDatetime: 2025-12-23T15:00:00Z
modDatetime: 2025-12-23T15:00:00Z  # Optional, for updates
title: Your Post Title Here
slug: custom-url-slug  # Optional, auto-generated from title
featured: true  # Shows on homepage
draft: false    # Set to true to hide from production
tags:
  - tag1
  - tag2
  - tag3
ogImage: https://example.com/image.jpg  # Or local path
description: |
  A clear, concise description for SEO and previews.
  Should be 1-2 sentences summarizing the post.
canonicalURL: https://original-source.com/post  # If republished
hideEditPost: false  # Optional, hides edit button
timezone: America/New_York  # Optional, overrides global timezone
---

Your markdown content here...
```

### Blog Post Best Practices

1. **Dates**: Use ISO 8601 format with timezone (`YYYY-MM-DDTHH:MM:SSZ`)
2. **Tags**: Use lowercase, hyphenated tags for consistency
3. **Descriptions**: Write compelling descriptions (used in meta tags and cards)
4. **Images**:
   - External images: Use full URLs
   - Local images: Place in `src/assets/images/` and import
5. **Featured Posts**: Limited to most important posts (shown on homepage)
6. **Draft Posts**: Set `draft: true` to work on posts without publishing

### Content Guidelines

- **Markdown**: Full GFM (GitHub Flavored Markdown) support
- **Code blocks**: Syntax highlighting via Shiki (supports `min-light` and `night-owl` themes)
- **Code features**:
  - File names: Use `js:title=filename.js` in code block info string
  - Highlighting: Use `// [!code highlight]` comments
  - Diffs: Use `// [!code ++]` for additions, `// [!code --]` for deletions
- **Table of Contents**: Automatically generated if heading exists: `## Table of contents`
- **Collapsible sections**: Use `remark-collapse` for ToC collapsing

## Development Workflow

### Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `pnpm install` | Install dependencies | First-time setup |
| `pnpm run dev` | Start dev server | Development (localhost:4321) |
| `pnpm run build` | Build production site | Runs type-check, build, and Pagefind indexing |
| `pnpm run preview` | Preview production build | After build |
| `pnpm run format:check` | Check formatting | CI/pre-commit |
| `pnpm run format` | Format code | Before committing |
| `pnpm run lint` | Lint with ESLint | Code quality checks |
| `pnpm run sync` | Generate TypeScript types | When content schema changes |

### Build Process Details

The `pnpm run build` command performs:
1. **Type checking**: `astro check` validates TypeScript
2. **Build**: `astro build` generates static site to `dist/`
3. **Search indexing**: `pagefind --site dist` creates search index
4. **Copy index**: `cp -r dist/pagefind public/` for deployment

**Important**: Pagefind must run after the build completes.

### Git Workflow

- **Branch naming**: Use descriptive names (e.g., `feature/add-dark-mode`, `fix/typo-in-post`)
- **Commits**: Follow conventional commits (optional but recommended)
- **Claude integration**: Branches created by Claude follow pattern `claude/description-XXXXX`

### CI/CD (GitHub Actions)

#### Claude Code Integration (`.github/workflows/claude.yml`)

- **Trigger**: Comment `@claude` in issues, PRs, or reviews
- **Purpose**: Interactive AI assistance for development tasks
- **Permissions**: Read-only access to code, PRs, issues; can read CI results

#### Automated PR Reviews (`.github/workflows/claude-code-review.yml`)

- **Trigger**: PR opened or updated
- **Purpose**: Automated code review focusing on:
  - Code quality and best practices
  - Potential bugs
  - Performance considerations
  - Security concerns
  - Test coverage
- **Model**: Claude Sonnet 4 (configurable)

## Coding Conventions

### TypeScript

- **Strict mode**: Enabled via `astro/tsconfigs/strict`
- **Path aliases**: Always use `@/*` instead of relative imports
  ```typescript
  // ✅ Good
  import { SITE } from "@/config";
  import { slugify } from "@/utils/slugify";

  // ❌ Bad
  import { SITE } from "../../config";
  ```
- **Type safety**: All blog content is type-checked via Zod schemas
- **Avoid `any`**: Use proper typing or `unknown` when necessary

### Styling

- **Primary**: TailwindCSS utility classes
- **Custom CSS**: Limited to `src/styles/` directory
- **Component styles**: Use scoped styles in `.astro` components when needed
- **Dark mode**: Implemented via CSS variables and theme toggle script
- **Typography**: Uses `@tailwindcss/typography` plugin for prose content

### Component Structure

Astro components follow this pattern:

```astro
---
// TypeScript frontmatter
import type { Props } from './types';
import Component from '@/components/Component.astro';

interface ComponentProps {
  title: string;
  optional?: boolean;
}

const { title, optional = false } = Astro.props;
---

<!-- Template -->
<div class="tailwind-classes">
  <h1>{title}</h1>
  {optional && <p>Optional content</p>}
</div>

<!-- Scoped styles (if needed) -->
<style>
  /* Scoped CSS */
</style>
```

### File Naming

- **Components**: PascalCase (e.g., `Header.astro`, `LinkButton.astro`)
- **Utilities**: camelCase (e.g., `getSortedPosts.ts`, `slugify.ts`)
- **Pages**: kebab-case for routes (e.g., `[...slug].astro`)
- **Blog posts**: kebab-case (e.g., `my-blog-post.md`)
- **Assets**: kebab-case (e.g., `icon-github.svg`)

## AI Assistant Guidelines

### When Working on This Codebase

1. **Always read before editing**: Use the Read tool to understand existing code
2. **Respect type safety**: Maintain TypeScript strictness
3. **Follow existing patterns**: Match the style of surrounding code
4. **Test locally**: Suggest running `pnpm run dev` to verify changes
5. **Check types**: Run `pnpm run sync` after schema changes

### Making Changes

#### Blog Posts

```markdown
✅ DO:
- Add new posts to src/data/blog/
- Use proper frontmatter schema
- Include clear descriptions for SEO
- Tag posts appropriately
- Use ISO dates with timezone

❌ DON'T:
- Modify existing post dates unless correcting errors
- Use inconsistent tag formatting
- Skip required frontmatter fields
- Add posts directly to pages/
```

#### Code Changes

```markdown
✅ DO:
- Use @/* path aliases
- Maintain existing component patterns
- Add types for new functions/components
- Format code with Prettier before committing
- Update relevant configuration if adding features

❌ DON'T:
- Use relative imports (../.. paths)
- Add unnecessary dependencies
- Modify build process without understanding impact
- Change core Astro configuration without discussion
- Break TypeScript strictness
```

#### Configuration Changes

```markdown
✅ DO:
- Update src/config.ts for site settings
- Document why configuration changed
- Test build after config changes
- Verify OG image generation still works

❌ DON'T:
- Change build commands without testing
- Modify TypeScript config loosely
- Remove Pagefind integration
- Change timezone without updating posts
```

### Common Tasks

#### Adding a New Component

1. Create in `src/components/ComponentName.astro`
2. Define props interface in frontmatter
3. Use TypeScript for prop validation
4. Import using `@/components/ComponentName.astro`
5. Add to relevant layout or page

#### Adding a Utility Function

1. Create in `src/utils/functionName.ts`
2. Export typed function
3. Add JSDoc comments
4. Import using `@/utils/functionName`

#### Modifying Search

- Pagefind is auto-generated; don't edit `public/pagefind/` directly
- Modify search UI in components that use Pagefind
- Rebuild after content changes: `pnpm run build`

#### Updating Dependencies

1. Check compatibility with Astro 5.x
2. Test build after updates
3. Verify Pagefind integration
4. Check OG image generation
5. Test dev server and preview

### Performance Considerations

- **Images**: Use Astro's Image component for optimization
- **Scripts**: Minimize client-side JavaScript
- **Styles**: Prefer Tailwind utilities over custom CSS
- **Build time**: Large blogs may have longer Pagefind indexing
- **Bundle size**: Check impact when adding dependencies

### SEO and Metadata

- **OG Images**: Generated dynamically per post (can be overridden in frontmatter)
- **Sitemap**: Auto-generated via `@astrojs/sitemap`
- **RSS**: Generated from blog posts
- **Meta tags**: Defined in Layout components
- **robots.txt**: Dynamically generated in `src/pages/robots.txt.ts`

## Troubleshooting

### Common Issues

**Build fails with Pagefind error**
- Ensure `dist/` exists before running Pagefind
- Check that build completes successfully first
- Verify Pagefind is installed: `pnpm install`

**Type errors after adding posts**
- Run `pnpm run sync` to regenerate types
- Check frontmatter matches schema in `content.config.ts`

**OG images not generating**
- Verify `@resvg/resvg-js` and `satori` are installed
- Check `src/utils/generateOgImages.ts` for errors
- Ensure post has title and description

**Search not working**
- Rebuild with `pnpm run build`
- Check `public/pagefind/` exists after build
- Verify Pagefind UI is loaded in template

**Dark mode issues**
- Check `public/toggle-theme.js` is loaded
- Verify CSS variables are defined
- Test theme persistence in localStorage

## Resources

- **Astro Docs**: https://docs.astro.build
- **AstroPaper Original**: https://github.com/satnaing/astro-paper
- **TailwindCSS**: https://tailwindcss.com/docs
- **Pagefind**: https://pagefind.app
- **Tabler Icons**: https://tabler-icons.io

## Questions?

For AI assistants: If unclear about a task:
1. Read relevant source files first
2. Check this documentation
3. Examine similar existing code
4. Ask clarifying questions before making assumptions
5. Suggest testing approach for verification

---

**Last Updated**: 2025-12-23
**Codebase Version**: Astro 5.15.9 / AstroPaper v5.5.0
