import { SITE_URL } from '#shared/site';
import type { BlogPost } from '#shared/blog';
import rawPosts from '../../.generated/blog.json';
import { renderRss } from '../utils/rss';

export default defineEventHandler(event => {
  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8');
  return renderRss(rawPosts as BlogPost[], SITE_URL);
});
