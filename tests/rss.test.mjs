import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { loadPosts } from '../scripts/blog.mjs';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const source = readFileSync(new URL('../server/utils/rss.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { renderRss } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const origin = 'https://example.com';
test('empty blog produces a channel without invented dates or items', () => {
  const xml = renderRss([], origin);
  assert.match(xml, /<rss version="2.0"/);
  assert.match(xml, /<link>https:\/\/example.com\/blog<\/link>/);
  assert.match(xml, /href="https:\/\/example.com\/rss.xml"/);
  assert.doesNotMatch(xml, /<item>|lastBuildDate|Invalid Date/);
});
test('feed escapes metadata, preserves publication dates and excludes unpublished posts', t => {
  const dir = mkdtempSync(join(tmpdir(), 'rss-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const post = (extra = '', date = '2026-01-01') => `---\ntitle: 'A & <B>'\ndescription: 'Quotes " & <markup>'\ndate: '${date}'\n${extra}\ntags: ['C# & .NET']\n---\n## Body\n\nArticle.`;
  writeFileSync(join(dir, 'older.md'), post('updated: "2026-03-01"'));
  writeFileSync(join(dir, 'newer.md'), post('', '2026-02-01'));
  writeFileSync(join(dir, 'draft.md'), post('draft: true'));
  writeFileSync(join(dir, 'future.md'), post('', '2099-01-01'));
  const xml = renderRss(loadPosts(dir, new Date('2026-10-05')), origin);
  assert.equal((xml.match(/<item>/g) || []).length, 2);
  assert.ok(xml.indexOf('/blog/newer') < xml.indexOf('/blog/older'));
  assert.match(xml, /<title>A &amp; &lt;B&gt;<\/title>/);
  assert.match(xml, /Quotes &quot; &amp; &lt;markup&gt;/);
  assert.match(xml, /<category>C# &amp; .NET<\/category>/);
  assert.match(xml, /<guid isPermaLink="true">https:\/\/example.com\/blog\/older<\/guid>/);
  assert.match(xml, /<pubDate>Thu, 01 Jan 2026 00:00:00 GMT<\/pubDate>/);
  assert.match(xml, /<lastBuildDate>Sun, 01 Mar 2026 00:00:00 GMT<\/lastBuildDate>/);
  assert.doesNotMatch(xml, /\/blog\/draft|\/blog\/future/);
});
