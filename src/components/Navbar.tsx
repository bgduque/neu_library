"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { PRIVILEGE_LABELS, ADMIN_PRIVILEGES } from "@/types";

export default function Navbar() {
  const { user, logout } = useAuth();
  const isAdmin = user && ADMIN_PRIVILEGES.includes(user.privilege);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
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
          <span className="font-bold text-gray-900">NEU Library</span>
        </Link>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Admin
            </Link>
          )}
          <Link
            href="/logs"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            My Logs
          </Link>
          <Link
            href="/checkin"
            className="text-sm font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Check In
          </Link>

          {user && (
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                  {user.displayName[0].toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-right">
                <p className="text-xs font-medium text-gray-800 leading-none">
                  {user.displayName}
                </p>
                <p className="text-xs text-gray-400">
                  {PRIVILEGE_LABELS[user.privilege]}
                </p>
              </div>
              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors ml-1"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
