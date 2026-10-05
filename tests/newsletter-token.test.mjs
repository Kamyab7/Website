import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../server/utils/newsletter-token.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { newsletterToken, readNewsletterToken, readNewsletterConfirmation } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const secret = 'a'.repeat(64);
const now = 1800000000000;
test('resubscription intent is encrypted and authenticated with the contact ID', () => {
  const token = newsletterToken('reader@example.com', secret, now, 'contact-id');
  assert.deepEqual(readNewsletterConfirmation(token, secret, now), { email: 'reader@example.com', resubscribeContactId: 'contact-id' });
  assert.equal(readNewsletterConfirmation(newsletterToken('reader@example.com', secret, now), secret, now).resubscribeContactId, undefined);
});
test('confirmation tokens hide the address and authenticate it', () => {
  const token = newsletterToken('reader@example.com', secret, now);
  assert.equal(readNewsletterToken(token, secret, now + 1000), 'reader@example.com');
  assert.equal(Buffer.from(token, 'base64url').includes(Buffer.from('reader@example.com')), false);
  const bytes = Buffer.from(token, 'base64url');
  bytes[30] ^= 1;
  assert.throws(() => readNewsletterToken(bytes.toString('base64url'), secret, now));
  assert.throws(() => readNewsletterToken(token, 'b'.repeat(64), now));
});
test('expired and malformed confirmation links are rejected', () => {
  const token = newsletterToken('reader@example.com', secret, now);
  assert.throws(() => readNewsletterToken(token, secret, now + 3600000));
  for (const input of ['', 'not-a-token', '!'.repeat(50), 'a'.repeat(1025)]) {
    assert.throws(() => readNewsletterToken(input, secret, now));
  }
});
