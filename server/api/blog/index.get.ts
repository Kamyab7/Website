import type { BlogPost } from '#shared/blog';
import rawPosts from '../../../.generated/blog.json';
import { BLOG_PAGE_SIZE } from '#shared/blog';
const posts = rawPosts as BlogPost[];
export default defineEventHandler(event => {
  const value = getQuery(event).page ?? '1';
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) throw createError({ statusCode: 404, statusMessage: 'Page not found' });
  const page = Number(value);
  const totalPages = Math.max(1, Math.ceil(posts.length / BLOG_PAGE_SIZE));
  if (!Number.isSafeInteger(page) || page > totalPages) throw createError({ statusCode: 404, statusMessage: 'Page not found' });
  return { page, totalPages, total: posts.length, posts: posts.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE).map(({ html, ...post }) => post) };
});
