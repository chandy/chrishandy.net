# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into chrishandy.net. A `src/components/posthog.astro` snippet component was created using the PostHog web snippet with an initialization guard to prevent double-initialization when Astro's `ClientRouter` (view transitions) re-runs inline scripts. The component is loaded in `src/layouts/Layout.astro` inside `<head>`, so PostHog is active on every page. Environment variables (`PUBLIC_POSTHOG_PROJECT_TOKEN`, `PUBLIC_POSTHOG_HOST`) are used throughout — no tokens are hardcoded. Six custom events were instrumented across five files to capture the key reader interactions on the blog.

| Event | Description | File |
|---|---|---|
| `post_read` | Fired when a reader opens a blog post — top of the reading funnel | `src/layouts/PostDetails.astro` |
| `code_copied` | Fired when a reader clicks the copy button on a code block | `src/layouts/PostDetails.astro` |
| `tag_clicked` | Fired when a reader clicks a tag to filter posts | `src/components/Tag.astro` |
| `search_performed` | Fired when a reader types a search query (debounced 500 ms) | `src/pages/search.astro` |
| `rss_feed_clicked` | Fired when a reader clicks the RSS feed icon on the homepage | `src/pages/index.astro` |
| `social_link_clicked` | Fired when a reader clicks a social media link (GitHub, X, LinkedIn) | `src/components/Socials.astro` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/219442/dashboard/1446177
- **Posts Read Over Time** (line chart, last 30 days): https://us.posthog.com/project/219442/insights/y6BH3vqI
- **Most Read Posts** (bar chart, broken down by post title): https://us.posthog.com/project/219442/insights/WnzxmORP
- **Tag Popularity** (bar chart, broken down by tag): https://us.posthog.com/project/219442/insights/YnNGBd8h
- **Top Search Queries** (bar chart, broken down by query): https://us.posthog.com/project/219442/insights/CBdhGixI
- **Reader Engagement Funnel: Read → Copy Code** (funnel): https://us.posthog.com/project/219442/insights/X7EAaPPY

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-astro-static/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
