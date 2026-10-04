<script setup lang="ts">
import { createAnalytics } from '~/utils/analytics';
const storageKey = 'kv-cookie-consent-v1';
const duration = 180 * 24 * 60 * 60 * 1000;
const open = ref(false);
const ready = ref(false);
const choice = ref<'accepted' | 'rejected' | null>(null);
let analytics: ReturnType<typeof createAnalytics>;
let removePageHook: (() => void) | undefined;
let expiresTimer: ReturnType<typeof setTimeout> | undefined;
const nuxt = useNuxtApp();
const measurementId = useRuntimeConfig().public.gaMeasurementId;

function readChoice() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (stored && ['accepted', 'rejected'].includes(stored.choice) && typeof stored.expires === 'number' && stored.expires > Date.now() && stored.expires <= Date.now() + duration) return stored as { choice: 'accepted' | 'rejected'; expires: number };
  } catch { /* Storage may be blocked; keep analytics off by default. */ }
  return null;
}
function syncChoice() {
  const stored = readChoice();
  choice.value = stored?.choice || null;
  open.value = !stored;
  if (stored?.choice === 'accepted') analytics.enable();
  else analytics.disable();
  clearTimeout(expiresTimer);
  // Recheck long-lived tabs without exceeding the browser timeout limit.
  if (stored) expiresTimer = setTimeout(syncChoice, Math.min(stored.expires - Date.now(), 2_147_483_647));
}
function choose(value: 'accepted' | 'rejected') {
  choice.value = value;
  try { localStorage.setItem(storageKey, JSON.stringify({ choice: value, expires: Date.now() + duration })); } catch { /* The choice still applies to this visit. */ }
  if (value === 'accepted') analytics.enable();
  else analytics.disable();
  open.value = false;
  clearTimeout(expiresTimer);
  if (readChoice()) expiresTimer = setTimeout(syncChoice, Math.min(duration, 2_147_483_647));
  nextTick(() => document.getElementById('cookie-settings')?.focus());
}
function onStorage(event: StorageEvent) {
  if (event.key === storageKey || event.key === null) syncChoice();
}
onMounted(() => {
  analytics = createAnalytics(window, measurementId);
  syncChoice();
  ready.value = true;
  removePageHook = nuxt.hook('page:finish', () => analytics.trackPage());
  window.addEventListener('storage', onStorage);
});
onBeforeUnmount(() => {
  removePageHook?.();
  clearTimeout(expiresTimer);
  window.removeEventListener('storage', onStorage);
});
</script>

<template>
  <template v-if="ready">
    <button id="cookie-settings" class="cookie-settings" type="button" :aria-expanded="open" aria-controls="cookie-consent" @click="open = !open">Cookie settings</button>
    <section v-if="open" id="cookie-consent" class="cookie-banner" role="region" aria-labelledby="cookie-title">
      <h2 id="cookie-title">Your cookie choice</h2>
      <p><a class="privacy-notice-link" href="/privacy">Privacy &amp; cookie notice</a></p>
      <p>With your permission, we use Google Analytics to understand which pages are useful. Analytics cookies help measure visits and send usage information to Google. You can reject analytics and still use the whole site.</p>
      <p class="cookie-detail">Your choice is saved on this device for 180 days. You can change it anytime using Cookie settings.</p>
      <p v-if="choice" class="cookie-detail">Analytics is currently {{ choice === 'accepted' ? 'allowed' : 'rejected' }}.</p>
      <div class="cookie-actions">
        <button type="button" @click="choose('rejected')">Reject analytics</button>
        <button type="button" @click="choose('accepted')">Accept analytics</button>
      </div>
    </section>
  </template>
</template>
