import { db } from "@/db";
import { blogSubmissions } from "@/db/schema";
import { desc } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";

const AdminBlogSubmissionsPage = async () => {
  const allSubmissions = await db.query.blogSubmissions.findMany({
    orderBy: [desc(blogSubmissions.createdAt)],
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Submissions</h1>
        <Link
          href="/admin"
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="grid gap-6">
        {allSubmissions.map((submission) => (
          <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{submission.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span>By: {submission.submitterName}</span>
                  <span>Email: {submission.submitterEmail}</span>
                  <span>Type: {submission.postType}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    submission.status === 'approved' 
                      ? 'bg-green-100 text-green-800'
                      : submission.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {submission.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    Submitted: {submission.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
              {submission.imageUrl && (
                <div className="ml-4">
                  <Image
                    src={submission.imageUrl}
                    alt={submission.title}
                    width={128}
                    height={72}
                    className="w-32 h-auto rounded object-cover"
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Excerpt:</h3>
              <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">
                {submission.excerpt}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Content:</h3>
              <div className="text-gray-700 text-sm bg-gray-50 p-3 rounded max-h-48 overflow-y-auto">
                {submission.content}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors text-sm">
                Approve
              </button>
              <button className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors text-sm">
                Reject
              </button>
              <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors text-sm">
                Edit & Publish
              </button>
            </div>
          </div>
        ))}
      </div>

      {allSubmissions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No blog submissions found.</p>
        </div>
      )}
    </div>
  );
};

export default AdminBlogSubmissionsPage;