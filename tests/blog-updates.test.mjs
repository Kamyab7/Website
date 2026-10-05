import test from 'node:test';
import assert from 'node:assert/strict';
import { publicationUpdates, broadcastBody, sendUpdates } from '../scripts/blog-updates.mjs';

const post = { slug: 'new-post', title: '<New & notes>', description: 'A "summary"' };
test('only newly published slugs trigger updates; edits do not', () => {
  assert.deepEqual(publicationUpdates([{ slug: 'old' }], [{ slug: 'old', title: 'Edited' }, post]), [post]);
});
test('broadcast escapes metadata and includes unsubscribe links in both formats', () => {
  const body = broadcastBody(post, 'author@example.com', 'segment');
  assert.match(body.html, /&lt;New &amp; notes&gt;/);
  assert.match(body.html, /https:\/\/kamyabvalipour.com\/blog\/new-post/);
  for (const format of [body.html, body.text]) assert.ok(format.includes('{{{RESEND_UNSUBSCRIBE_URL}}}'));
  assert.equal(body.segment_id, 'segment');
});
test('retry skips sent broadcasts and resumes an existing draft across pagination', async () => {
  const calls = [];
  const draft = { slug: 'draft-post', title: 'Draft', description: 'Summary' };
  const responses = [
    { has_more: true, data: [{ id: 'sent', name: broadcastBody(post).name, status: 'sent' }] },
    { has_more: false, data: [{ id: 'draft', name: broadcastBody(draft).name, status: 'draft' }] },
    { id: 'draft' },
  ];
  await sendUpdates([post, draft], { apiKey: 'test', from: 'author@example.com', segmentId: 'segment', request: async (url, options) => {
    calls.push([url, options.method]);
    return { ok: true, json: async () => responses.shift() };
  } });
  assert.equal(calls.length, 3);
  assert.ok(calls[1][0].endsWith('&after=sent'));
  assert.deepEqual(calls[2], ['https://api.resend.com/broadcasts/draft/send', 'POST']);
});
test('provider failure stops sending', async () => {
  await assert.rejects(sendUpdates([post], { apiKey: 'test', from: 'author@example.com', segmentId: 'segment', request: async () => ({ ok: false, status: 403 }) }), /HTTP 403/);
});
