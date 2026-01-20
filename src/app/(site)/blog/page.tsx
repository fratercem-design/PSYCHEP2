"use client";

import { useState, useEffect } from "react";
import { BlogPost, BlogPostProps } from "./components/BlogPost";
import { ClipPost, ClipPostProps } from "./components/ClipPost";
import { SubmitPostForm } from "./components/SubmitPostForm";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { desc } from "drizzle-orm";

import { TrendingSidebar } from "./components/TrendingSidebar";

export default function BlogPage() {
  const [posts, setPosts] = useState<(BlogPostProps | ClipPostProps)[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  async function loadMorePosts() {
    const morePosts = await db.query.blogPosts.findMany({
      columns: {
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        imageUrl: true,
        postType: true,
      },
      orderBy: [desc(blogPosts.createdAt)],
      limit: 6,
      offset: posts.length,
    });

    if (morePosts.length === 0) {
      setHasMore(false);
    }

    setPosts([...posts, ...morePosts]);
  }

  useEffect(() => {
    loadMorePosts();
  }, []);

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Psycheverse Blog</h1>
        <button
          onClick={() => setShowSubmitForm(!showSubmitForm)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          {showSubmitForm ? "Back to Posts" : "Submit a Tip"}
        </button>
      </div>

      {showSubmitForm ? (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Submit a Tip</h2>
          <SubmitPostForm />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => {
                if (post.postType === "clip") {
                  return <ClipPost key={post.slug} {...post} />;
                }
                return <BlogPost key={post.slug} {...post} />;
              })}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMorePosts}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <TrendingSidebar />
          </div>
        </div>
      )}
    </main>
  );
}
