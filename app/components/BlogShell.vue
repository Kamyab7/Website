<template>
  <div class="site-shell blog-shell">
    <a class="skip-link" href="#main">Skip to content</a>
    <SiteHeader />
    <main id="main" class="blog-main"><slot /></main>
    <footer><p>© {{ new Date().getFullYear() }} Kamyab Valipour</p><a href="/rss.xml">RSS feed</a><a href="/privacy">Privacy &amp; cookies</a><a href="/">Back to portfolio ↗</a></footer>
  </div>
</template>
