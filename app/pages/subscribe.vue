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
    <header class="blog-heading"><p class="eyebrow">EMAIL UPDATES</p><h1>{{ complete ? 'You’re subscribed' : 'Confirm your subscription' }}<span class="accent">.</span></h1></header>
    <div class="prose">
      <p v-if="!complete">Confirm that you want to receive blog updates from Kamyab Valipour.</p>
      <button v-if="token && !complete" class="button" type="button" :disabled="pending" @click="confirm">{{ pending ? 'Confirming…' : 'Confirm subscription' }}</button>
      <p v-if="message" role="status">{{ message }}</p>
      <p><a href="/blog">Back to the blog</a></p>
    </div>
  </BlogShell>
</template>
