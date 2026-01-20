import { db } from "@/db";
import { blogPosts, blogComments } from "@/db/schema";
import { desc, sql, count, eq } from "drizzle-orm";
import Link from "next/link";

export async function TrendingSidebar() {
  // Calculate trending score based on recency and comment count
  const trendingPosts = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      createdAt: blogPosts.createdAt,
      commentCount: count(blogComments.id),
      // Trending score: recent posts get a boost, posts with comments get a boost
      trendingScore: sql<number>`
        CASE 
          WHEN ${blogPosts.createdAt} > NOW() - INTERVAL '24 hours' THEN 10
          WHEN ${blogPosts.createdAt} > NOW() - INTERVAL '7 days' THEN 5
          WHEN ${blogPosts.createdAt} > NOW() - INTERVAL '30 days' THEN 2
          ELSE 1
        END + ${count(blogComments.id)} * 2
      `.as("trending_score"),
    })
    .from(blogPosts)
    .leftJoin(blogComments, eq(blogPosts.id, blogComments.postId))
    .groupBy(blogPosts.id, blogPosts.title, blogPosts.slug, blogPosts.createdAt)
    .orderBy(sql`trending_score DESC`)
    .limit(5);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Trending</h2>
      <ul>
        {trendingPosts.map((post) => (
          <li key={post.id} className="mb-2">
            <Link href={`/blog/${post.slug}`} className="text-blue-500 hover:underline">
              {post.title}
            </Link>
            <div className="text-sm text-gray-500 mt-1">
              {post.commentCount > 0 && (
                <span className="mr-2">{post.commentCount} comments</span>
              )}
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
