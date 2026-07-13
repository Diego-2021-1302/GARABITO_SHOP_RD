export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  image: string;
  publishedAt: string;
  readingTime: string;
  tags: string[];
}
