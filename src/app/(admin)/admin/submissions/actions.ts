"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { blogSubmissions, blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

async function checkAdmin() {
  const session = await auth();
  // @ts-expect-error - role is a custom property
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function approveSubmission(submissionId: number) {
  await checkAdmin();

  const submission = await db.query.blogSubmissions.findFirst({
    where: eq(blogSubmissions.id, submissionId),
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  // Create a new blog post from the submission
  await db.insert(blogPosts).values({
    title: submission.title,
    content: submission.content,
    excerpt: submission.excerpt,
    imageUrl: submission.imageUrl || "",
    postType: submission.postType,
    // This is a placeholder - you'll want to assign a real author
    authorId: "c5b6a7e8-f9d0-4a9b-8c7d-6e5f4a3b2a1c", // A generic admin/system user ID
    slug: submission.title.toLowerCase().replace(/\s+/g, "-").slice(0, 50),
  });

  // Update the submission status
  await db
    .update(blogSubmissions)
    .set({ status: "approved" })
    .where(eq(blogSubmissions.id, submissionId));

  revalidatePath("/admin/submissions");
  revalidatePath("/blog");
}

export async function rejectSubmission(submissionId: number) {
  await checkAdmin();

  await db
    .update(blogSubmissions)
    .set({ status: "rejected" })
    .where(eq(blogSubmissions.id, submissionId));

  revalidatePath("/admin/submissions");
}