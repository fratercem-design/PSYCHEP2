import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Comments } from "../components/Comments";
import { LiveContextSidebar } from "../components/LiveContextSidebar";

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.slug, params.slug),
    with: {
      comments: {
        with: {
          author: true,
        },
      },
      creators: {
        with: {
          creator: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const creatorIds = post.creators.map(creator => creator.creatorId);

  return (
    <main className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-gray-500 mb-8">{post.createdAt.toDateString()}</p>
          <div
            className="prose lg:prose-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          ></div>
          <Comments postId={post.id} initialComments={post.comments} />
        </div>
        <div className="lg:col-span-1">
          <LiveContextSidebar creatorIds={creatorIds} />
        </div>
      </div>
    </main>
  );
}
