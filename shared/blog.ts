export const BLOG_PAGE_SIZE = 6;
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated: string;
  tags: string[];
  image: string;
  imageAlt: string;
  readingMinutes: number;
  html: string;
}
export type BlogSummary = Omit<BlogPost, 'html'>;
export const blogPagePath = (page: number) => page === 1 ? '/blog' : `/blog/page/${page}`;
export function formatBlogDate(value: string) {
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}
