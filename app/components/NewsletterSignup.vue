<script setup lang="ts">
const turnstileToken = ref('');
const challenge = ref<{ reset: () => void }>();
const email = ref('');
const website = ref('');
const consent = ref(false);
const pending = ref(false);
const message = ref('');
const failed = ref(false);
const submitted = ref(false);
const feedback = ref<HTMLElement>();
async function subscribe() {
  if (pending.value || submitted.value || !turnstileToken.value) return;
  pending.value = true;
  message.value = '';
  failed.value = false;
  try {
    const selectedTheme = document.documentElement.dataset.theme;
    const theme = selectedTheme === 'light' || selectedTheme === 'dark'
      ? selectedTheme
      : window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    const result = await $fetch('/api/subscribe', { method: 'POST', body: { email: email.value, website: website.value, consent: consent.value, turnstileToken: turnstileToken.value, theme } });
    message.value = result.message;
    email.value = '';
    consent.value = false;
    submitted.value = true;
    await nextTick();
    feedback.value?.focus();
  } catch (error) {
    failed.value = true;
    message.value = (error as { data?: { statusMessage?: string } }).data?.statusMessage || 'Unable to subscribe. Please try again.';
  } finally {
    turnstileToken.value = '';
    if (!submitted.value) challenge.value?.reset();
    pending.value = false;
  }
}
</script>

<template>
  <section class="newsletter" aria-labelledby="newsletter-heading">
    <p class="eyebrow">STAY IN THE LOOP</p>
    <h2 id="newsletter-heading">New notes, in your inbox<span class="accent">.</span></h2>
    <p>Get an email when I share new articles and updates. Unsubscribe whenever you like.</p>
    <form @submit.prevent="subscribe">
      <template v-if="!submitted">
      <label for="newsletter-email">Email address</label>
      <div class="newsletter-fields">
        <input id="newsletter-email" v-model="email" type="email" name="email" autocomplete="email" maxlength="254" placeholder="you@example.com" required :disabled="pending" autofocus>
        <button class="button" type="submit" :disabled="pending || !turnstileToken">{{ pending ? 'Sending…' : 'Subscribe' }}</button>
      </div>
      <div class="newsletter-trap" aria-hidden="true"><label for="newsletter-website">Website</label><input id="newsletter-website" v-model="website" name="website" tabindex="-1" autocomplete="off"></div>
      <label class="newsletter-consent"><input v-model="consent" type="checkbox" required :disabled="pending"><span>I agree to receive email updates. Read the <a href="/privacy#email-updates">privacy notice</a>.</span></label>
      <TurnstileChallenge ref="challenge" v-model="turnstileToken" />
      </template>
      <div class="newsletter-feedback" role="status" aria-live="polite" aria-atomic="true">
        <div v-if="message" ref="feedback" tabindex="-1" class="newsletter-notice" :class="{ 'newsletter-error': failed }">
          <svg v-if="!failed" class="newsletter-notice-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 7 9 6 9-6" /></svg>
          <div>
            <strong>{{ failed ? 'Please try again' : 'Check your inbox' }}</strong>
            <p>{{ message }}</p>
          </div>
        </div>
      </div>
    </form>
  </section>
</template>
