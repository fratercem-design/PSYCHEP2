import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { blogSubmissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SubmissionCard } from "./SubmissionCard";

export default async function SubmissionsDashboard() {
  const session = await auth();

  // @ts-expect-error - role is a custom property
  if (session?.user?.role !== "admin") {
    redirect("/");
  }

  const submissions = await db.query.blogSubmissions.findMany({
    where: eq(blogSubmissions.status, "pending"),
  });

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Submissions Dashboard</h1>
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <p>No pending submissions.</p>
        ) : (
          submissions.map((submission) => (
            <SubmissionCard key={submission.id} submission={submission} />
          ))
        )}
      </div>
    </main>
  );
}