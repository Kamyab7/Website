export default defineNuxtConfig({
  compatibilityDate: "2026-03-01",
  devtools: { enabled: false },
  css: ["~/assets/css/main.css"],
  runtimeConfig: { public: { siteUrl: "https://kamyabvalipour.com" } },
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },
  nitro: { prerender: { routes: ["/", "/robots.txt", "/sitemap.xml"] } },
});
