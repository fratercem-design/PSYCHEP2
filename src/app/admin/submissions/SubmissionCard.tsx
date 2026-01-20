"use client";

import { useTransition } from "react";
import { approveSubmission, rejectSubmission } from "./actions";

type Submission = {
  id: number;
  title: string;
  excerpt: string;
  submitterName: string;
  submitterEmail: string;
};

export function SubmissionCard({ submission }: { submission: Submission }) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(() => {
      approveSubmission(submission.id);
    });
  };

  const handleReject = () => {
    startTransition(() => {
      rejectSubmission(submission.id);
    });
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-semibold">{submission.title}</h2>
      <p className="text-sm text-gray-500">From: {submission.submitterName} ({submission.submitterEmail})</p>
      <p className="mt-2">{submission.excerpt}</p>
      <div className="flex space-x-2 mt-4">
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isPending ? "Approving..." : "Approve"}
        </button>
        <button
          onClick={handleReject}
          disabled={isPending}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isPending ? "Rejecting..." : "Reject"}
        </button>
      </div>
    </div>
  );
}