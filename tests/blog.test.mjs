import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadPosts, generateBlog } from '../scripts/blog.mjs';

function fixture(t, files) {
  const dir = mkdtempSync(join(tmpdir(), 'blog-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  return dir;
}
const post = (extra = '', body = '## Heading\n\nHello **world**.') => `---\ntitle: Test post\ndescription: A description\ndate: "2026-01-01"\n${extra}\n---\n${body}`;
test('renders Markdown, sorts posts, and excludes drafts and future posts', t => {
  const dir = fixture(t, { 'first.md': post(), 'second.md': post('updated: "2026-01-03"').replace('2026-01-01', '2026-01-02'), 'draft.md': post('draft: true'), 'future.md': post().replace('2026-01-01', '2099-01-01') });
  const result = loadPosts(dir, new Date('2026-10-04'));
  assert.deepEqual(result.map(p => p.slug), ['second', 'first']);
  assert.match(result[0].html, /<h2>Heading<\/h2>/);
  assert.match(result[0].html, /<strong>world<\/strong>/);
  assert.equal(result[0].updated, '2026-01-03');
});
test('raw HTML and unsafe Markdown links cannot produce active scripts', t => {
  const dir = fixture(t, { 'safe.md': post('', '<script>alert(1)</script>\n\n[bad](javascript:alert(1))') });
  const [result] = loadPosts(dir);
  assert.doesNotMatch(result.html, /<script|href="javascript:/);
  assert.match(result.html, /&lt;script&gt;/);
});
test('invalid dates and missing metadata fail the build', t => {
  for (const text of [post().replace('2026-01-01', '2026-02-30'), post().replace('title: Test post', 'title: ""'), post('draft: "false"')]) {
    const dir = fixture(t, { 'invalid.md': text });
    assert.throws(() => loadPosts(dir), /invalid.md:/);
  }
});
test('reserved slugs and invalid modification dates are rejected', t => {
  assert.throws(() => loadPosts(fixture(t, { 'page.md': post() })), /reserved/);
  assert.throws(() => loadPosts(fixture(t, { 'valid.md': post('updated: "2025-01-01"') })), /cannot precede/);
});

test('generates pagination and published article routes without draft content', t => {
  const root = fixture(t, {});
  const dir = join(root, 'content/blog');
  mkdirSync(dir, { recursive: true });
  for (let i = 1; i <= 7; i++) writeFileSync(join(dir, `post-${i}.md`), post());
  writeFileSync(join(dir, 'secret.md'), post('draft: true', 'PRIVATE DRAFT'));
  const routes = generateBlog(root);
  assert.equal(routes.length, 9);
  assert.ok(routes.includes('/blog/page/2'));
  assert.ok(routes.includes('/blog/post-7'));
  assert.ok(!routes.includes('/blog/secret'));
  assert.doesNotMatch(readFileSync(join(root, '.generated/blog.json'), 'utf8'), /PRIVATE DRAFT/);
});
