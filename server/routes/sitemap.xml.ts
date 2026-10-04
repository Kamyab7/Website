import rawPosts from '../../.generated/blog.json';
import { BLOG_PAGE_SIZE, blogPagePath, type BlogPost } from '#shared/blog';
export default defineEventHandler((event) => {
  const origin = new URL(useRuntimeConfig(event).public.siteUrl).origin;
  const posts = rawPosts as BlogPost[];
  const escape = (value: string) => value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!);
  const entries = [
    { path: '/', updated: undefined },
    { path: '/privacy', updated: undefined },
    ...Array.from({ length: Math.max(1, Math.ceil(posts.length / BLOG_PAGE_SIZE)) }, (_, i) => ({ path: blogPagePath(i + 1), updated: undefined })),
    ...posts.map(post => ({ path: `/blog/${post.slug}`, updated: post.updated })),
  ];
  setHeader(event, 'content-type', 'application/xml; charset=utf-8');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(entry => `<url><loc>${escape(origin + entry.path)}</loc>${entry.updated ? `<lastmod>${entry.updated}</lastmod>` : ''}</url>`).join('')}</urlset>`;
});
