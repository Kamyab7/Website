export default defineEventHandler((event) => {
  const url = new URL(useRuntimeConfig(event).public.siteUrl).origin;
  setHeader(event, "content-type", "text/plain; charset=utf-8");
  return `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`;
});
