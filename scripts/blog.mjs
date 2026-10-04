import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

export const pageSize = 6;
const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true });
export function loadPosts(directory, now = new Date()) {
  return readdirSync(directory).filter(file => file.endsWith('.md')).flatMap(file => {
    const { data, content } = matter(readFileSync(resolve(directory, file), 'utf8'));
    const fail = message => { throw new Error(`${file}: ${message}`); };
    if (data.draft !== undefined && typeof data.draft !== 'boolean') fail('draft must be true or false');
    if (data.draft === true) return [];
    const slug = file.slice(0, -3);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug === 'page') fail('use a lowercase, hyphenated filename; "page" is reserved');
    for (const key of ['title', 'description']) {
      if (typeof data[key] !== 'string' || !data[key].trim()) fail(`${key} is required`);
    }
    const date = key => {
      const value = data[key] instanceof Date ? data[key].toISOString().slice(0, 10) : data[key];
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) fail(`${key} must be a valid YYYY-MM-DD date`);
      return value;
    };
    const published = date('date');
    const updated = data.updated ? date('updated') : published;
    if (updated < published) fail('updated cannot precede date');
    if (published > now.toISOString().slice(0, 10)) return [];
    if (!content.trim()) fail('post body is required');
    if (data.tags && (!Array.isArray(data.tags) || data.tags.some(tag => typeof tag !== 'string'))) fail('tags must be a list of strings');
    const image = data.image || '/social-card.png';
    if (typeof image !== 'string' || !/^(\/(?!\/)|https:\/\/)/.test(image)) fail('image must be a site-relative path or HTTPS URL');
    return [{ slug, title: data.title.trim(), description: data.description.trim(), date: published, updated,
      tags: data.tags || [], image, imageAlt: typeof data.imageAlt === 'string' ? data.imageAlt : data.title,
      readingMinutes: Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200)), html: markdown.render(content) }];
  }).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}
export function generateBlog(root) {
  const posts = loadPosts(resolve(root, 'content/blog'));
  const output = resolve(root, '.generated');
  mkdirSync(output, { recursive: true });
  writeFileSync(resolve(output, 'blog.json'), JSON.stringify(posts));
  return ['/blog', ...Array.from({ length: Math.max(0, Math.ceil(posts.length / pageSize) - 1) }, (_, i) => `/blog/page/${i + 2}`), ...posts.map(post => `/blog/${post.slug}`)];
}
