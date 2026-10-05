<script setup lang="ts">
const newsletterOpen = useState<boolean>('newsletter-open', () => false);
const menuOpen = ref(false);
const header = ref<HTMLElement>();
const menuButton = ref<HTMLButtonElement>();
const navigationId = useId();
const route = useRoute();
let mobileQuery: MediaQueryList | undefined;

function closeMenu(restoreFocus = false) {
  header.value?.querySelectorAll('details[open]').forEach(node => node.removeAttribute('open'));
  menuOpen.value = false;
  if (restoreFocus) menuButton.value?.focus();
}
function onKeydown(event: KeyboardEvent) {
  // The appearance picker handles its own Escape key first.
  if (event.key !== 'Escape' || !menuOpen.value || header.value?.querySelector('details[open]')) return;
  event.preventDefault();
  closeMenu(true);
}
function onPointerDown(event: PointerEvent) {
  if (event.target instanceof Node && !header.value?.contains(event.target)) closeMenu();
}
function onBreakpointChange() {
  const focusInside = header.value?.contains(document.activeElement) && document.activeElement !== menuButton.value;
  const focusOnToggle = document.activeElement === menuButton.value;
  closeMenu(Boolean(mobileQuery?.matches && focusInside));
  if (!mobileQuery?.matches && focusOnToggle) header.value?.querySelector<HTMLAnchorElement>('nav a')?.focus();
}
async function subscribe() {
  closeMenu(Boolean(mobileQuery?.matches));
  await nextTick();
  newsletterOpen.value = true;
}
watch(() => route.fullPath, () => closeMenu());
onMounted(() => {
  mobileQuery = window.matchMedia('(max-width: 760px)');
  mobileQuery.addEventListener('change', onBreakpointChange);
  document.addEventListener('pointerdown', onPointerDown);
});
onBeforeUnmount(() => {
  mobileQuery?.removeEventListener('change', onBreakpointChange);
  document.removeEventListener('pointerdown', onPointerDown);
});
</script>

<template>
    <header ref="header" class="header" :class="{ 'menu-open': menuOpen }" @keydown="onKeydown">
      <a class="wordmark" href="/" aria-label="Kamyab Valipour home"
        >kv<span>.</span></a
      >
      <button ref="menuButton" class="menu-toggle" type="button" :aria-expanded="menuOpen" :aria-controls="navigationId" :aria-label="menuOpen ? 'Close navigation menu' : 'Open navigation menu'" @click="menuOpen ? closeMenu() : menuOpen = true">
        <span class="menu-toggle-label">{{ menuOpen ? 'Close' : 'Menu' }}</span>
        <span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>
      </button>
      <nav :id="navigationId" class="header-links" aria-label="Main navigation">
        <a
          class="blog-link"
          href="/blog"
          :aria-current="route.path.startsWith('/blog') ? 'page' : undefined"
          @click="closeMenu()"
        >Blog</a>
        <a class="blog-link rss-link" href="/rss.xml" aria-label="Subscribe to the blog RSS feed" title="RSS feed" @click="closeMenu()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">
            <circle cx="5" cy="19" r="1" fill="currentColor" />
            <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" />
          </svg>
          <span class="rss-label">RSS feed</span>
        </a>
        <ThemeToggle />
        <button class="button newsletter-trigger" type="button" aria-haspopup="dialog" @click="subscribe">Subscribe <span class="subscribe-arrow" aria-hidden="true">→</span></button>
      </nav>
    </header>
</template>
