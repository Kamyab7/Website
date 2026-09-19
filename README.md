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
