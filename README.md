# Kamyab Valipour — personal website

A responsive, single-page Nuxt 4 website with server-rendered content, a locally hosted GitHub portrait, accessible navigation, and a graphite / mint visual design.

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

Verified production generation and TypeScript checking, layouts at 1440, 768, 390, and 320 pixels, clipboard copying, section navigation, image loading, canonical and structured data, robots.txt, and sitemap.xml.

The social image source is `scripts/social-card.html`; render it at 1200×630 pixels to update `public/social-card.png`.
