import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../server/api/subscribe.post.ts', import.meta.url), 'utf8').replace(/^import .*;$/gm, '');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const factory = new Function('defineEventHandler', 'newsletterConfig', 'readBody', 'createError', 'resendRequest', 'newsletterToken', 'confirmationEmail', 'SITE_URL', 'verifyTurnstile', outputText.replace('export default ', 'return '));
function signup(existing, failure, verificationFailure) {
  const calls = [];
  const handler = factory(fn => fn, () => ({ resendApiKey: 'key', newsletterSecret: 'secret', resendFrom: 'updates@example.com' }), async () => ({ email: 'Reader@Example.com', consent: true }), error => error,
    async (_key, path, options) => { calls.push({ path, options }); if (failure) throw failure; return options.method === 'GET' ? existing : { id: 'sent' }; },
    () => 'token', () => ({ text: 'confirmation' }), 'https://example.com', async () => { if (verificationFailure) throw verificationFailure; });
  return { handler, calls };
}
test('active subscribers receive no email', async () => {
  for (const unsubscribed of [false]) {
    const { handler, calls } = signup({ unsubscribed });
    await handler({});
    assert.equal(calls.length, 1);
    assert.equal(calls[0].options.method, 'GET');
  }
});
test('unsubscribed contacts receive confirmation without being reactivated at signup', async () => {
  const { handler, calls } = signup({ id: 'contact-id', unsubscribed: true });
  await handler({});
  assert.deepEqual(calls.map(call => call.options.method), ['GET', 'POST']);
  assert.equal(calls[1].path, '/emails');
});
test('absent contacts receive confirmation and the same public response', async () => {
  const absent = signup(null);
  const existing = signup({ unsubscribed: false });
  assert.deepEqual(await absent.handler({}), await existing.handler({}));
  assert.equal(absent.calls[0].path, '/contacts/reader%40example.com');
  assert.equal(absent.calls[1].path, '/emails');
});
test('lookup failures stop signup without sending email', async () => {
  const { handler, calls } = signup(null, new Error('provider unavailable'));
  await assert.rejects(handler({}), /provider unavailable/);
  assert.equal(calls.length, 1);
});

test('failed bot verification prevents every Resend request', async () => {
  const { handler, calls } = signup(null, null, new Error('verification failed'));
  await assert.rejects(handler({}), /verification failed/);
  assert.equal(calls.length, 0);
});
