<script setup lang="ts">
import { formatBlogDate } from '#shared/blog';
definePageMeta({ key: route => route.path });
const slug = String(useRoute().params.slug);
const { data, error } = await useFetch(`/api/blog/${encodeURIComponent(slug)}`);
if (error.value || !data.value) throw createError({ statusCode: error.value?.statusCode || 500, statusMessage: error.value?.statusCode === 404 ? 'Post not found' : 'Unable to load post' });
const post = data.value;
const origin = new URL(useRuntimeConfig().public.siteUrl).origin;
const path = `/blog/${post.slug}`;
useBlogSeo({ title: `${post.title} — Kamyab Valipour`, description: post.description, path, image: post.image, imageAlt: post.imageAlt, article: post,
  schema: { '@context': 'https://schema.org', '@graph': [
    { '@type': 'BlogPosting', '@id': `${origin}${path}#article`, headline: post.title, description: post.description,
      datePublished: post.date, dateModified: post.updated, image: new URL(post.image, origin).href,
      author: { '@type': 'Person', name: 'Kamyab Valipour', url: `${origin}/` },
      mainEntityOfPage: `${origin}${path}`, url: `${origin}${path}`, keywords: post.tags.join(', '), inLanguage: 'en' },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${origin}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${origin}${path}` },
    ] },
  ] },
});
</script>
<template>
  <BlogShell>
    <article class="blog-article">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/blog">Blog</a></nav>
      <header class="blog-heading">
        <div class="post-meta"><time :datetime="post.date">{{ formatBlogDate(post.date) }}</time><span>{{ post.readingMinutes }} min read</span></div>
        <h1>{{ post.title }}</h1>
        <p>{{ post.description }}</p>
        <p class="post-byline">By Kamyab Valipour<span v-if="post.updated !== post.date"> · Updated <time :datetime="post.updated">{{ formatBlogDate(post.updated) }}</time></span></p>
        <ul v-if="post.tags.length" class="tags" aria-label="Topics"><li v-for="tag in post.tags" :key="tag">{{ tag }}</li></ul>
      </header>
      <div class="prose" v-html="post.html" />
      <a class="back-to-blog" href="/blog">← All articles</a>
    </article>
  </BlogShell>
</template>
