import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadPosts } from './blog.mjs';

const siteUrl = 'https://kamyabvalipour.com';
const escape = value => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function publicationUpdates(previous, current) {
  const published = new Set(previous.map(post => post.slug));
  return current.filter(post => !published.has(post.slug));
}

export function broadcastBody(post, from, segmentId) {
  const url = `${siteUrl}/blog/${post.slug}`;
  return {
    name: `blog:${createHash('sha256').update(`${siteUrl}/blog/${post.slug}`).digest('hex')}`,
    segment_id: segmentId, from, subject: `New post: ${post.title}`,
    text: `${post.title}\n\n${post.description}\n\nRead the post: ${url}\n\nUnsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#f1f5f9;background:#0f172a"><p>Kamyab Valipour · New notes</p><h1>${escape(post.title)}</h1><p>${escape(post.description)}</p><p><a style="color:#60a5fa" href="${url}">Read the post →</a></p><p><a style="color:#a3b1c6" href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a></p></div>`,
  };
}

export async function sendUpdates(posts, { apiKey, from, segmentId, request = fetch }) {
  if (!apiKey || !from || !segmentId) throw new Error('Set NUXT_RESEND_API_KEY, NUXT_RESEND_FROM and NUXT_RESEND_SEGMENT_ID in GitHub secrets.');
  async function api(path, body) {
    // Stay below Resend's default request rate; never log provider payloads.
    await new Promise(done => setTimeout(done, 600));
    const response = await request(`https://api.resend.com${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Resend request failed (HTTP ${response.status}). Check Resend before retrying.`);
    return response.json();
  }
  const broadcasts = [];
  let after = '';
  do {
    const page = await api(`/broadcasts?limit=100${after ? `&after=${encodeURIComponent(after)}` : ''}`);
    broadcasts.push(...page.data);
    after = page.has_more ? page.data.at(-1)?.id : '';
    if (page.has_more && !after) throw new Error('Invalid Resend pagination response.');
  } while (after);
  for (const post of posts) {
    const body = broadcastBody(post, from, segmentId);
    const matches = broadcasts.filter(item => item.name === body.name);
    if (matches.length > 1) throw new Error(`Multiple broadcasts exist for ${post.slug}; inspect Resend before retrying.`);
    let broadcast = matches[0];
    if (broadcast && broadcast.status !== 'draft') {
      console.log(`Skipping existing broadcast for ${post.slug} (${broadcast.status}).`);
      continue;
    }
    // Persist a draft first: retries find the same campaign rather than creating another.
    if (!broadcast) broadcast = await api('/broadcasts', body);
    if (!broadcast.id) throw new Error('Resend did not return a broadcast ID.');
    await api(`/broadcasts/${encodeURIComponent(broadcast.id)}/send`, {});
    console.log(`Queued update for ${post.slug}.`);
  }
}

async function main() {
  const before = process.env.BLOG_BEFORE;
  if (!before || !/^[a-f0-9]{40}$/.test(before) || /^0+$/.test(before)) throw new Error('BLOG_BEFORE must be an existing full commit SHA; initial repository pushes are not emailed.');
  const directory = mkdtempSync(resolve(tmpdir(), 'blog-before-'));
  let previous;
  try {
    const files = execFileSync('git', ['ls-tree', '-r', '--name-only', before, '--', 'content/blog'], { encoding: 'utf8' }).trim().split('\n');
    for (const file of files.filter(file => /^content\/blog\/[^/]+\.md$/.test(file))) {
      writeFileSync(resolve(directory, file.slice('content/blog/'.length)), execFileSync('git', ['show', `${before}:${file}`]));
    }
    previous = loadPosts(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
  const posts = publicationUpdates(previous, loadPosts(resolve('content/blog')));
  console.log(`Newly published posts: ${posts.map(post => post.slug).join(', ') || 'none'}`);
  if (!posts.length || process.env.BLOG_DRY_RUN === 'true') return;
  await sendUpdates(posts, { apiKey: process.env.NUXT_RESEND_API_KEY, from: process.env.NUXT_RESEND_FROM, segmentId: process.env.NUXT_RESEND_SEGMENT_ID });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
