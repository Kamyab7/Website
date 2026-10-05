<script setup lang="ts">
useSeoMeta({ title: 'Confirm subscription — Kamyab Valipour', robots: 'noindex, nofollow' });
useHead({ meta: [{ name: 'referrer', content: 'no-referrer' }] });
const token = ref('');
const pending = ref(false);
const complete = ref(false);
const message = ref('');
onMounted(() => {
  token.value = window.location.hash.slice(1);
  window.history.replaceState(null, '', window.location.pathname);
  if (!token.value) message.value = 'No confirmation link found. Please subscribe from the blog.';
});
async function confirm() {
  if (pending.value || complete.value) return;
  pending.value = true;
  try {
    const result = await $fetch('/api/newsletter/confirm', { method: 'POST', body: { token: token.value } });
    message.value = result.message;
    complete.value = true;
    token.value = '';
  } catch (error) {
    message.value = (error as { data?: { statusMessage?: string } }).data?.statusMessage || 'Unable to confirm. Please try again.';
  } finally { pending.value = false; }
}
</script>
<template>
  <BlogShell>
    <section class="subscription-card" aria-labelledby="subscription-title" :aria-busy="pending">
      <div class="subscription-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <template v-if="complete"><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></template>
          <template v-else><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 7 9 6 9-6" /></template>
        </svg>
      </div>
      <p class="eyebrow">EMAIL UPDATES</p>
      <h1 id="subscription-title">{{ complete ? 'You’re on the list' : 'One last step' }}<span class="accent">.</span></h1>
      <p class="subscription-intro">{{ complete ? 'Thanks for joining. I’m glad to have you here.' : 'Confirm your email to get new notes on software engineering, AI, and things I’m building.' }}</p>
      <div v-if="!complete" class="subscription-actions">
        <button v-if="token" class="button newsletter-trigger" type="button" :disabled="pending" @click="confirm">{{ pending ? 'Confirming…' : 'Confirm subscription' }}<span v-if="!pending" aria-hidden="true">→</span></button>
        <p v-if="token" class="subscription-detail">Unsubscribe from any update, whenever you like.</p>
      </div>
      <div class="subscription-status" role="status" aria-live="polite" aria-atomic="true">
        <p v-if="message" class="subscription-message" :class="{ 'is-complete': complete }">{{ message }}</p>
      </div>
      <div class="subscription-footer">
        <a class="subscription-back" href="/blog">{{ complete ? 'Explore the blog' : 'Back to the blog' }} <span aria-hidden="true">↗</span></a>
        <a class="subscription-privacy" href="/privacy#email-updates">Privacy notice</a>
      </div>
    </section>
  </BlogShell>
</template>
