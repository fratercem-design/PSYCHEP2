import { getBlogPosts } from "./actions";
import { BlogClient } from "./BlogClient";
import { TrendingSidebar } from "./components/TrendingSidebar";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function BlogPage() {
  const initialPosts = await getBlogPosts(0, 6);

  return (
    <BlogClient 
      // @ts-expect-error - types might mismatch slightly
      initialPosts={initialPosts} 
      sidebar={<TrendingSidebar />} 
    />
  );
}
