import { db } from "@/db";
import { blogComments } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { postId, authorId, content } = await req.json();

  if (!postId || !authorId || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const newComment = await db.insert(blogComments).values({
    postId,
    authorId,
    content,
  }).returning();

  return NextResponse.json(newComment[0]);
}
