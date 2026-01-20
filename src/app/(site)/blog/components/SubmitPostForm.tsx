"use client";

import { useState } from "react";

export function SubmitPostForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      content: formData.get("content"),
      excerpt: formData.get("excerpt"),
      submitterName: formData.get("submitterName"),
      submitterEmail: formData.get("submitterEmail"),
      postType: formData.get("postType"),
    };

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus("success");
        e.currentTarget.reset();
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium mb-1">
          Excerpt (Short Summary) *
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1">
          Full Story / Details *
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label htmlFor="submitterName" className="block text-sm font-medium mb-1">
          Your Name *
        </label>
        <input
          type="text"
          id="submitterName"
          name="submitterName"
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label htmlFor="submitterEmail" className="block text-sm font-medium mb-1">
          Your Email *
        </label>
        <input
          type="email"
          id="submitterEmail"
          name="submitterEmail"
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label htmlFor="postType" className="block text-sm font-medium mb-1">
          Post Type
        </label>
        <select
          id="postType"
          name="postType"
          defaultValue="article"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
        >
          <option value="article">Article</option>
          <option value="clip">Clip</option>
        </select>
      </div>

      {submitStatus === "success" && (
        <div className="p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
          Thank you! Your submission has been received and is under review.
        </div>
      )}

      {submitStatus === "error" && (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
          Something went wrong. Please try again.
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Submit Tip"}
      </button>
    </form>
  );
}