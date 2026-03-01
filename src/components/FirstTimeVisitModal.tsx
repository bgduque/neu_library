"use client";

import { useState } from "react";
import { updateUserProfile } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import { NEU_COLLEGES } from "@/types";

export default function FirstTimeVisitModal() {
  const { user, refreshProfile } = useAuth();
  const [college, setCollege] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!user || user.firstVisitCompleted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!college) {
      setError("Please select your college or office.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await updateUserProfile(user.uid, {
        college,
        firstVisitCompleted: true,
      });
      await refreshProfile();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome to NEU Library!
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            This is your first visit. Please select the college or office you
            belong to. This is a one-time prompt.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="college"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              College / Office
            </label>
            <select
              id="college"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Select your college / office --</option>
              {NEU_COLLEGES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !college}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {submitting ? "Saving…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
