"use server";

import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function getBlogPosts(offset: number = 0, limit: number = 6) {
  const posts = await db.query.blogPosts.findMany({
    columns: {
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      imageUrl: true,
      postType: true,
      createdAt: true,
      authorId: true,
    },
    orderBy: [desc(blogPosts.createdAt)],
    limit: limit,
    offset: offset,
  });
  
  // Serialize dates if necessary, but Server Actions can handle Date objects usually.
  // However, passing to client components might require serialization if they are not simple JSON.
  // Drizzle returns Date objects. Next.js Server Actions can serialize them.
  return posts;
}
