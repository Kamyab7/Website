<script setup lang="ts">
import { SITE_URL } from "#shared/site";
import { blogPagePath, formatBlogDate } from '#shared/blog';
const newsletterOpen = useState<boolean>('newsletter-open', () => false);
const props = defineProps<{ page: number }>();
const { data, error } = await useFetch('/api/blog', { query: { page: props.page }, key: `blog-page-${props.page}` });
if (error.value || !data.value) throw createError({ statusCode: error.value?.statusCode || 500, statusMessage: error.value?.statusCode === 404 ? 'Page not found' : 'Unable to load blog' });
const listing = data.value;
const origin = SITE_URL;
const path = blogPagePath(props.page);
const title = props.page === 1 ? 'Blog — Kamyab Valipour' : `Blog — Page ${props.page} — Kamyab Valipour`;
const description = `Notes on software engineering, .NET, AI, and building things.${props.page > 1 ? ` Page ${props.page}.` : ''}`;
useBlogSeo({ title, description, path, schema: {
  '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url: `${origin}${path}`,
  mainEntity: { '@type': 'ItemList', itemListElement: listing.posts.map((post, index) => ({ '@type': 'ListItem', position: (props.page - 1) * 6 + index + 1, url: `${origin}/blog/${post.slug}`, name: post.title })) },
} });
</script>

<template>
  <BlogShell>
    <header class="blog-heading">
      <p class="eyebrow">NOTES & IDEAS</p>
      <h1>From the blog<span class="accent">.</span></h1>
      <p>Things I’m learning, building, and thinking about.</p>
    </header>
    <div v-if="!listing.posts.length" class="blog-empty"><h2>More to come.</h2><p>New articles will appear here soon.</p></div>
    <div v-else class="post-list">
      <article v-for="post in listing.posts" :key="post.slug" class="post-preview">
        <div class="post-meta"><time :datetime="post.date">{{ formatBlogDate(post.date) }}</time><span>{{ post.readingMinutes }} min read</span></div>
        <h2><a :href="`/blog/${post.slug}`">{{ post.title }} <span class="accent" aria-hidden="true">↗</span></a></h2>
        <p>{{ post.description }}</p>
        <ul v-if="post.tags.length" class="tags" aria-label="Topics"><li v-for="tag in post.tags" :key="tag">{{ tag }}</li></ul>
      </article>
    </div>
    <nav v-if="listing.totalPages > 1" class="blog-pagination" aria-label="Blog pagination">
      <a v-if="page > 1" :href="blogPagePath(page - 1)" rel="prev">← Newer posts</a>
      <span>Page {{ page }} of {{ listing.totalPages }}</span>
      <a v-if="page < listing.totalPages" :href="blogPagePath(page + 1)" rel="next">Older posts →</a>
    </nav>
    <section id="newsletter" class="newsletter" aria-labelledby="newsletter-invite-heading">
      <p class="eyebrow">STAY IN THE LOOP</p>
      <h2 id="newsletter-invite-heading">New notes, in your inbox<span class="accent">.</span></h2>
      <p>Get an email when I share new articles and updates.</p>
      <button class="button newsletter-invite" type="button" aria-haspopup="dialog" @click="newsletterOpen = true">Subscribe to updates</button>
    </section>
  </BlogShell>
</template>
