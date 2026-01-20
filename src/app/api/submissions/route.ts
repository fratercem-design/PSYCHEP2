import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogSubmissions } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, excerpt, submitterName, submitterEmail, postType, imageUrl } = body;

    // Basic validation
    if (!title || !content || !excerpt || !submitterName || !submitterEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert the submission into the database
    const submission = await db.insert(blogSubmissions).values({
      title,
      content,
      excerpt,
      submitterName,
      submitterEmail,
      postType: postType || "article",
      imageUrl: imageUrl || null,
    }).returning();

    return NextResponse.json(
      { message: "Submission received", submission: submission[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}