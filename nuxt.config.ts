import { fileURLToPath } from "node:url";
import { generateBlog } from "./scripts/blog.mjs";

const root = fileURLToPath(new URL(".", import.meta.url));
const blogRoutes = generateBlog(root);

export default defineNuxtConfig({
  compatibilityDate: "2026-03-01",
  hooks: {
    "builder:watch": (_event, path) => {
      if (path.replaceAll("\\", "/").includes("content/blog/")) generateBlog(root);
    },
  },
  devtools: { enabled: false },
  css: ["~/assets/css/main.css"],
  runtimeConfig: { public: { siteUrl: "https://kamyabvalipour.com" } },
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },
  nitro: { prerender: { routes: ["/", "/robots.txt", "/sitemap.xml", ...blogRoutes] } },
});
