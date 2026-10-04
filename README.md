# Kamyab Valipour — personal website

A responsive, single-screen Nuxt 4 profile with server-rendered content, a locally hosted GitHub portrait, accessible contact links, and a graphite / mint visual design.

## Development

Use Node.js 22.12+.

```sh
npm install
npm run dev
```

## Production

Copy `.env.example` to `.env` and set `NUXT_PUBLIC_SITE_URL` to the real production origin **before building**. The default is the domain listed on Kamyab's GitHub profile, `https://kamyabvalipour.com`.

```sh
npm run typecheck
npm run generate
```

Deploy `.output/public` to any static hosting provider. Alternatively, run `npm run build` and serve with `node .output/server/index.mjs` for a Node deployment.

The homepage, robots.txt, and sitemap.xml are prerendered. SEO includes a title, description, canonical URL, Open Graph and Twitter cards, a 1200×630 social image, and ProfilePage / Person JSON-LD. Configure your production domain, HTTPS, and preferred-domain redirects at your hosting provider. Search engine indexing is not guaranteed by metadata.

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
- Posts, pagination, and the index are prerendered at build time. Metadata includes
  canonical URLs, Open Graph, Twitter cards, BlogPosting and breadcrumb structured
  data, and sitemap modification dates. Invalid posts or pagination return 404.
- `NUXT_PUBLIC_SITE_URL` must be your public site origin when building/deploying so
  canonical URLs and sitemap links point to the correct domain.
- Rebuild and redeploy after publishing. Restart `npm run dev` after adding or
  changing Markdown if your running dev session does not pick it up automatically.
- `.generated/blog.json` is generated from Markdown when Nuxt loads its config;
  do not edit it directly. Published HTML is served through server endpoints and
  prerender payloads; drafts are never included.
- Run `node --test tests/blog.test.mjs` to check content validation and safe Markdown.

Existing articles on the external blog are not imported automatically. If migrating
existing URLs, add redirects on the old blog host to the matching new post URLs.
