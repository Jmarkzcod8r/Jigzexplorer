"use client";

import React, { useState } from "react";
import { ThumbsUp, Heart, Laugh, Frown } from "lucide-react";
import Swal from "sweetalert2";

export default function ConnectPage() {
  const [suggestion, setSuggestion] = useState("");
  const [comments, setComments] = useState<string[]>([]);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Empty Feedback",
        text: "Please write something before submitting!",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    setComments([...comments, suggestion]);
    setSuggestion("");

    Swal.fire({
      icon: "success",
      title: "Thank you!",
      text: "Your feedback has been submitted successfully 🚀",
      confirmButtonColor: "#3b82f6",
    });
  };

  const handleReaction = (reaction: string) => {
    setSelectedReaction(reaction);
    Swal.fire({
      icon: "info",
      title: "Reaction Recorded!",
      text: `You reacted with ${reaction}`,
      confirmButtonColor: "#3b82f6",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Connect with Us 💬
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-xl text-center">
        We’d love to hear your suggestions, comments, or quick reactions about
        the Jigsaw Puzzle! Your feedback helps us improve and maybe add cool
        features you’ll enjoy. 🚀
      </p>

      {/* Feedback Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 space-y-4"
      >
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={4}
          placeholder="Share your suggestion or comment here..."
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition"
        >
          Submit Feedback
        </button>
      </form>

      {/* Reactions */}
      <div className="flex gap-6 mt-8">
        <button
          onClick={() => handleReaction("👍")}
          className={`p-3 rounded-full shadow-md hover:scale-110 transition ${
            selectedReaction === "👍" ? "bg-blue-200" : "bg-white"
          }`}
        >
          <ThumbsUp className="w-6 h-6 text-blue-600" />
        </button>
        <button
          onClick={() => handleReaction("😍")}
          className={`p-3 rounded-full shadow-md hover:scale-110 transition ${
            selectedReaction === "😍" ? "bg-pink-200" : "bg-white"
          }`}
        >
          <Heart className="w-6 h-6 text-pink-600" />
        </button>
        <button
          onClick={() => handleReaction("😂")}
          className={`p-3 rounded-full shadow-md hover:scale-110 transition ${
            selectedReaction === "😂" ? "bg-yellow-200" : "bg-white"
          }`}
        >
          <Laugh className="w-6 h-6 text-yellow-600" />
        </button>
        <button
          onClick={() => handleReaction("😡")}
          className={`p-3 rounded-full shadow-md hover:scale-110 transition ${
            selectedReaction === "😡" ? "bg-red-200" : "bg-white"
          }`}
        >
          <Frown className="w-6 h-6 text-red-600" />
        </button>
      </div>

      {/* Comments Section */}
      <div className="w-full max-w-lg mt-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Recent Feedback
        </h2>
        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-gray-500">No feedback yet. Be the first! ✨</p>
          ) : (
            comments.map((comment, idx) => (
              <div
                key={idx}
                className="bg-white shadow p-3 rounded-lg text-gray-700"
              >
                {comment}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
