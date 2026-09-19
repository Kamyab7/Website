export default defineEventHandler((event) => {
  const url = new URL(useRuntimeConfig(event).public.siteUrl).origin;
  setHeader(event, "content-type", "application/xml; charset=utf-8");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url}/</loc></url></urlset>`;
});
