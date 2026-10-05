<script setup lang="ts">
const email = ref('');
const website = ref('');
const consent = ref(false);
const pending = ref(false);
const message = ref('');
const failed = ref(false);
async function subscribe() {
  if (pending.value) return;
  pending.value = true;
  message.value = '';
  failed.value = false;
  try {
    const result = await $fetch('/api/subscribe', { method: 'POST', body: { email: email.value, website: website.value, consent: consent.value } });
    message.value = result.message;
    email.value = '';
    consent.value = false;
  } catch (error) {
    failed.value = true;
    message.value = (error as { data?: { statusMessage?: string } }).data?.statusMessage || 'Unable to subscribe. Please try again.';
  } finally { pending.value = false; }
}
</script>

<template>
  <section class="newsletter" aria-labelledby="newsletter-heading">
    <p class="eyebrow">STAY IN THE LOOP</p>
    <h2 id="newsletter-heading">New notes, in your inbox<span class="accent">.</span></h2>
    <p>Get an email when I share new articles and updates. Unsubscribe whenever you like.</p>
    <form @submit.prevent="subscribe">
      <label for="newsletter-email">Email address</label>
      <div class="newsletter-fields">
        <input id="newsletter-email" v-model="email" type="email" name="email" autocomplete="email" maxlength="254" placeholder="you@example.com" required :disabled="pending" autofocus>
        <button class="button" type="submit" :disabled="pending">{{ pending ? 'Sending…' : 'Subscribe' }}</button>
      </div>
      <div class="newsletter-trap" aria-hidden="true"><label for="newsletter-website">Website</label><input id="newsletter-website" v-model="website" name="website" tabindex="-1" autocomplete="off"></div>
      <label class="newsletter-consent"><input v-model="consent" type="checkbox" required :disabled="pending"><span>I agree to receive email updates. Read the <a href="/privacy#email-updates">privacy notice</a>.</span></label>
      <p v-if="message" role="status" aria-live="polite" :class="{ 'newsletter-error': failed }">{{ message }}</p>
    </form>
  </section>
</template>
