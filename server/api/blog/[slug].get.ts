import type { BlogPost } from '#shared/blog';
import rawPosts from '../../../.generated/blog.json';
const posts = rawPosts as BlogPost[];
export default defineEventHandler(event => {
  const post = posts.find(post => post.slug === getRouterParam(event, 'slug'));
  if (!post) throw createError({ statusCode: 404, statusMessage: 'Post not found' });
  return post;
});
