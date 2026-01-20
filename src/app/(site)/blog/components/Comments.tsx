"use client";

import { useState, useEffect } from "react";

export function Comments({ postId, initialComments }: { postId: number, initialComments: any[] }) {
  const [comments, setComments] = useState<any[]>(initialComments);
  const [newComment, setNewComment] = useState("");

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        postId, 
        authorId: "user_2iJ5f5n3z5Z6q5g5f5n3z5Z6q5g", // Hardcoded for now
        content: newComment 
      }),
    });

    if (res.ok) {
      const newCommentData = await res.json();
      setComments([...comments, newCommentData]);
      setNewComment("");
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Comments</h2>
      <form onSubmit={handleSubmitComment} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Add a comment..."
          rows={3}
        ></textarea>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
        >
          Submit
        </button>
      </form>
      <div>
        {comments.map((comment) => (
          <div key={comment.id} className="border-t py-4">
            <p className="font-bold">{comment.author.name}</p>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
