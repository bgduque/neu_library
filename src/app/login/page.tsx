"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signInWithGoogle } from "@/lib/auth";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");

  if (!loading && user) {
    router.replace("/dashboard");
    return null;
  }

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setError("");
    try {
      await signInWithGoogle();
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign-in failed. Please try again."
      );
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600 mb-4">
            <svg
              className="w-10 h-10 text-white"
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
          <h1 className="text-3xl font-bold text-gray-900">NEU Library</h1>
          <p className="text-gray-500 mt-1 text-sm">Visitor Management System</p>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 mt-0.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p>
              Only <strong>@neu.edu.ph</strong> institutional email addresses
              are permitted to access this system.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn || loading}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {signingIn ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg viewBox="0 0 48 48" className="w-5 h-5">
              <path
                fill="#4285F4"
                d="M44.5 20H24v8.5h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
              />
              <path
                fill="#34A853"
                d="M6.3 14.7l7 5.1C15.1 16 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2c-7.6 0-14.2 4.2-17.7 10.7z"
              />
              <path
                fill="#FBBC05"
                d="M24 46c5.5 0 10.5-1.9 14.4-5l-6.7-5.5C29.8 37 27 38 24 38c-5.8 0-10.6-3.1-11.8-7.5l-6.9 5.3C8 41.6 15.5 46 24 46z"
              />
              <path
                fill="#EA4335"
                d="M44.5 20H24v8.5h11.8c-.5 2.9-2.1 5.3-4.3 6.9l6.7 5.5C42.3 37.3 45 31 45 24c0-1.4-.2-2.7-.5-4z"
              />
            </svg>
          )}
          {signingIn ? "Signing in…" : "Sign in with Google"}
        </button>

        <p className="text-center text-xs text-gray-400 mt-6">
          New Era University · Library Visitor System
        </p>
      </div>
    </main>
  );
}
