import { getBlogPosts } from "./actions";
import { BlogClient } from "./BlogClient";
import { TrendingSidebar } from "./components/TrendingSidebar";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description: "Transmissions from The World. Creator spotlights, community updates, ritual recaps, and signals from across the Circle.",
};

export default async function BlogPage() {
  const initialPosts = await getBlogPosts(0, 6);

  return (
    <BlogClient
      initialPosts={initialPosts}
      sidebar={<TrendingSidebar />}
    />
  );
}
