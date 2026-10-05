import type { BlogPost } from '../../shared/blog';

const escapeXml = (value: string) => value
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, '')
  .replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!);

export function renderRss(posts: BlogPost[], origin: string) {
  const latestUpdate = posts.map(post => post.updated).sort().at(-1);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog — Kamyab Valipour</title>
    <link>${escapeXml(`${origin}/blog`)}</link>
    <description>Notes on software engineering, .NET, AI, and building things.</description>
    <language>en</language>
    <atom:link href="${escapeXml(`${origin}/rss.xml`)}" rel="self" type="application/rss+xml" />
    ${latestUpdate ? `<lastBuildDate>${new Date(latestUpdate).toUTCString()}</lastBuildDate>` : ''}
    ${posts.map(post => {
      const url = escapeXml(`${origin}/blog/${post.slug}`);
      return `<item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.tags.map(tag => `<category>${escapeXml(tag)}</category>`).join('')}
    </item>`;
    }).join('\n')}
  </channel>
</rss>`;
}
