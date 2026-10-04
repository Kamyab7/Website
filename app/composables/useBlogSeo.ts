export function useBlogSeo(options: { title: string; description: string; path: string; image?: string; imageAlt?: string; article?: { date: string; updated: string }; schema: Record<string, unknown> }) {
  const origin = new URL(useRuntimeConfig().public.siteUrl).origin;
  const url = `${origin}${options.path}`;
  const image = new URL(options.image || '/social-card.png', origin).href;
  useSeoMeta({
    title: options.title, description: options.description, author: 'Kamyab Valipour',
    robots: 'index, follow', themeColor: '#0f172a',
    ogTitle: options.title, ogDescription: options.description, ogUrl: url,
    ogType: options.article ? 'article' : 'website', ogSiteName: 'Kamyab Valipour', ogLocale: 'en_US',
    ogImage: image, ogImageAlt: options.imageAlt || options.title,
    twitterCard: 'summary_large_image', twitterTitle: options.title,
    twitterDescription: options.description, twitterImage: image, twitterImageAlt: options.imageAlt || options.title,
    ...(options.article ? { articlePublishedTime: options.article.date, articleModifiedTime: options.article.updated, articleAuthor: [`${origin}/`] } : {}),
  });
  useHead({
    link: [{ rel: 'canonical', href: url }],
    script: [{ key: 'blog-schema', type: 'application/ld+json', innerHTML: JSON.stringify(options.schema).replace(/</g, '\\u003c') }],
  });
}
