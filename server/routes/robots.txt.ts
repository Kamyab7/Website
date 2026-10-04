import { SITE_URL } from "#shared/site";
export default defineEventHandler((event) => {
  const url = SITE_URL;
  setHeader(event, "content-type", "text/plain; charset=utf-8");
  return `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`;
});
