# Kamyab Valipour — personal website

A responsive, single-screen Nuxt 4 profile with server-rendered content, a locally hosted GitHub portrait, accessible contact links, and a graphite / mint visual design.

## Development

Use Node.js 22.12+.

```sh
npm install
npm run dev
```

## Production

The production origin is hardcoded as `https://kamyabvalipour.com` in `shared/site.ts`.

```sh
npm run typecheck
npm run build
npm run start
```

Deploy the complete `.output` directory to a Node-capable host and run `npm run start` (Node.js 22.12+). The server listens on port 3000 by default; set `PORT` and `HOST` as needed. Put your domain and HTTPS proxy in front of this server. Deploying only `.output/public` does not run SSR.

SSR is explicitly enabled in `nuxt.config.ts`. Production pages render on each initial request, including their content and SEO metadata, then hydrate in the browser for interactions. Blog data is still generated from local Markdown at build time, so content changes require a rebuild and redeploy.

For static hosting, use `npm run generate` instead and deploy `.output/public`. Nuxt crawls linked pages and prerenders their HTML. Both SSR and prerendering provide crawlable HTML without requiring JavaScript; switching between them alone does not guarantee better rankings.

The homepage is server-rendered, and robots.txt and sitemap.xml are served by server routes. SEO includes a title, description, canonical URL, Open Graph and Twitter cards, a 1200×630 social image, and ProfilePage / Person JSON-LD. Configure your production domain, HTTPS, and preferred-domain redirects at your hosting provider. Search engine indexing is not guaranteed by metadata.

Edit content and contact links in `app/app.vue`, styling in `app/assets/css/main.css`, and the portrait in `public/portrait.jpg`. The biography is adapted from the public GitHub profile; LinkedIn is linked without scraping its content. Fonts load from Google Fonts with local system fallbacks. No analytics or cookies are added.

## Validation

Verified production generation, TypeScript checking, clipboard copying, and viewport fit on desktop, tablet, mobile, and landscape screens. All profile content is visible together at standard screen sizes; unusually small viewports or enlarged accessibility text can scroll rather than clipping content. SEO metadata, robots.txt, and sitemap.xml remain available in the static output.

The social image source is `scripts/social-card.html`; render it at 1200×630 pixels to update `public/social-card.png`.

## Built-in blog

Write posts in `content/blog/<slug>.md`. The filename becomes `/blog/<slug>`.
Use lowercase letters, numbers, and hyphens; `page` is reserved for pagination.
Start by editing `content/blog/welcome.md`, which is an unpublished draft.

```md
---
title: "Your article title"
description: "A concise, unique summary for search results and social previews."
date: "2026-10-04"
updated: "2026-10-04" # Optional; must be on or after date
tags: [".NET", "Engineering"]
image: "/social-card.png" # Optional; site-relative path or HTTPS URL
imageAlt: "Description of the social preview image" # Optional
draft: false
---

Write your article here. Start body sections with ## because the title is the H1.
```

- Posts are sorted newest first, with six posts per page. Subsequent pages use
  `/blog/page/2`, `/blog/page/3`, etc. `/blog/page/1` redirects to `/blog`.
- Markdown supports headings, links, lists, fenced code, tables, and images.
  Raw HTML is disabled. Code blocks use plain monospace formatting.
- Drafts and posts with a future publication date are excluded from the generated
  data, public routes, and sitemap. Publishing scheduled posts requires a rebuild.
- Posts, pagination, and the index are server-rendered on request (`npm run build`)
  or prerendered for static hosting (`npm run generate`). Metadata includes
  canonical URLs, Open Graph, Twitter cards, BlogPosting and breadcrumb structured
  data, and sitemap modification dates. Invalid posts or pagination return 404.
- Canonical URLs and sitemap links use the production origin in `shared/site.ts`.
- Rebuild and redeploy after publishing. Restart `npm run dev` after adding or
  changing Markdown if your running dev session does not pick it up automatically.
- `.generated/blog.json` is generated from Markdown when Nuxt loads its config;
  do not edit it directly. Published HTML is served through server endpoints and
  Nuxt payloads; drafts are never included.
- Run `node --test tests/blog.test.mjs` to check content validation and safe Markdown.

Existing articles on the external blog are not imported automatically. If migrating
existing URLs, add redirects on the old blog host to the matching new post URLs.

## Google Analytics 4 and cookie consent

TODO: Set `NUXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX` in your environment (see
`.env.example`), then rebuild/redeploy. The default is blank, so no Google tag
loads until you supply a valid ID **and** a visitor accepts analytics.

The banner uses basic consent mode: no Google analytics script or analytics request
before consent or after rejection on a fresh visit. Advertising consent stays denied.
Accept/reject choices are stored locally for 180 days; Cookie settings lets visitors
withdraw permission. Withdrawal disables collection and removes accessible GA cookies.
Storage changes also synchronize across tabs. If browser storage is unavailable,
the choice applies only to the current visit.

Page views are sent on initial acceptance and Nuxt page navigation. In your GA4 web
stream, turn off Enhanced Measurement's automatic browser-history page views to
avoid duplicate SPA page views. The manual page-view event excludes query strings,
URL fragments, and referrers. Do not put personal data into page titles or paths.
Google Analytics reporting itself can only be verified once a real ID is configured.

Implementation reference: [Google's basic consent mode](https://developers.google.com/tag-platform/security/concepts/consent-mode).

## Privacy notice

The `/privacy` page describes the implemented consent mechanism, external font/image
requests, and contact handling. It is linked from the banner and both site footers.
Before enabling GA4, confirm the actual GA4 retention period and Google account
processing/transfer arrangements, then update the notice. Also confirm your hosting
provider, server-log retention, and correspondence retention practices; these cannot
be determined from the source code. The page currently describes these limits without
inventing provider names or retention periods.

## RSS feed

Subscribe at `https://kamyabvalipour.com/rss.xml`. The RSS 2.0 feed includes all
published posts, newest first, with titles, summaries, canonical links, stable
permalink identifiers, publication dates, and tags. Drafts and future-dated posts
are excluded by the same content pipeline as the blog. An empty blog produces a
valid feed with no items.

Every page includes an RSS discovery link, and blog footers include a visible
RSS link. The feed is prerendered for both SSR and static deployments; rebuild
and redeploy after publishing or editing a post.

Format reference: [RSS 2.0 specification](https://www.rssboard.org/rss-specification).

## Theme preference

The header theme icon cycles through System (monitor), Light (sun), and Dark
(moon). System is the default and follows the operating system's color scheme,
including changes while the page is open. The preference is stored under
`kv-theme` in local storage and synchronized across tabs. If storage is blocked,
manual changes still apply for the current page visit. An early head script
applies saved preferences before the page paints; system colors also work without
JavaScript.
