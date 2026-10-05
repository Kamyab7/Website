import { fileURLToPath } from "node:url";
import { generateBlog } from "./scripts/blog.mjs";
import { SITE_URL } from "./shared/site";

const root = fileURLToPath(new URL(".", import.meta.url));
generateBlog(root);

export default defineNuxtConfig({
  compatibilityDate: "2026-03-01",
  ssr: true,
  hooks: {
    "builder:watch": (_event, path) => {
      if (path.replaceAll("\\", "/").includes("content/blog/")) generateBlog(root);
    },
  },
  devtools: { enabled: false },
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      // TODO: Set NUXT_PUBLIC_GA_MEASUREMENT_ID to your GA4 G-XXXXXXXXXX ID.
      gaMeasurementId: "",
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "alternate", type: "application/rss+xml", title: "Blog — Kamyab Valipour", href: `${SITE_URL}/rss.xml` },
      ],
    },
  },
  nitro: { prerender: { routes: ["/rss.xml"] } },
});
