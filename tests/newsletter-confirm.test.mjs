import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../server/api/newsletter/confirm.post.ts', import.meta.url), 'utf8').replace(/^import .*;$/gm, '');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const factory = new Function('defineEventHandler', 'newsletterConfig', 'readBody', 'createError', 'resendRequest', 'readNewsletterConfirmation', outputText.replace('export default ', 'return '));
function confirmation(existing, contactId, failureMethod) {
  const calls = [];
  const handler = factory(fn => fn, () => ({ resendApiKey: 'key', newsletterSecret: 'secret', resendSegmentId: 'blog' }), async () => ({ token: 'token' }), error => error,
    async (_key, path, options) => {
      calls.push({ path, ...options });
      if (options.method === failureMethod) throw new Error('Provider failure');
      return options.method === 'GET' ? existing : { id: 'contact' };
    }, () => ({ email: 'reader@example.com', resubscribeContactId: contactId }));
  return { handler, calls };
}
test('fresh resubscription confirmation restores segment and opts in existing contact', async () => {
  const { handler, calls } = confirmation({ id: 'contact', unsubscribed: true }, 'contact');
  await handler({});
  assert.equal(calls[1].path, '/contacts/reader%40example.com/segments/blog');
  assert.equal(calls[2].method, 'PATCH');
  assert.deepEqual(calls[2].body, { unsubscribed: false });
});
test('original signup and wrong-contact links cannot override unsubscribe', async () => {
  for (const id of [undefined, 'other-contact']) {
    const { handler, calls } = confirmation({ id: 'contact', unsubscribed: true }, id);
    await assert.rejects(handler({}), error => error.statusCode === 409);
    assert.equal(calls.length, 1);
  }
});
test('deleted contact cannot be recreated with an old resubscription link', async () => {
  const { handler, calls } = confirmation(null, 'contact');
  await assert.rejects(handler({}), error => error.statusCode === 409);
  assert.equal(calls.length, 1);
});
test('segment failure prevents reactivation', async () => {
  const { handler, calls } = confirmation({ id: 'contact', unsubscribed: true }, 'contact', 'POST');
  await assert.rejects(handler({}), /Provider failure/);
  assert.equal(calls.length, 2);
});
test('new signup still creates a contact in the newsletter segment', async () => {
  const { handler, calls } = confirmation(null);
  await handler({});
  assert.deepEqual(calls[1].body, { email: 'reader@example.com', unsubscribed: false, segments: [{ id: 'blog' }] });
});
