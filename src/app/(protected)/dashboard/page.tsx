"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import FirstTimeVisitModal from "@/components/FirstTimeVisitModal";
import { getActiveLog, getUserLogs } from "@/lib/firestore";
import type { VisitorLog } from "@/types";
import { VISIT_REASON_LABELS } from "@/types";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [activeLog, setActiveLog] = useState<VisitorLog | null>(null);
  const [recentLogs, setRecentLogs] = useState<VisitorLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoadingLogs(true);
      const [active, logs] = await Promise.all([
        getActiveLog(user.uid),
        getUserLogs(user.uid),
      ]);
      setActiveLog(active);
      setRecentLogs(logs.slice(0, 5));
      setLoadingLogs(false);
    };
    load();
  }, [user]);

  return (
    <>
      <Navbar />
      <FirstTimeVisitModal />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.displayName?.split(" ")[0]}!
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {user?.college ?? "College not set"} &middot; {user?.email}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Visits"
            value={recentLogs.length}
            icon="📚"
            loading={loadingLogs}
          />
          <StatCard
            label="Active Session"
            value={activeLog ? "In Progress" : "None"}
            icon="🟢"
            loading={loadingLogs}
          />
          <StatCard
            label="Last Visit"
            value={
              recentLogs[0]
                ? recentLogs[0].checkInTime.toLocaleDateString()
                : "—"
            }
            icon="🗓"
            loading={loadingLogs}
          />
        </div>

        {/* Active session alert */}
        {activeLog && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="font-medium text-green-800">Active Session</p>
                <p className="text-sm text-green-600">
                  {VISIT_REASON_LABELS[activeLog.visitReason]} · since{" "}
                  {activeLog.checkInTime.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <Link
              href="/checkin"
              className="text-sm font-medium text-green-700 hover:text-green-900"
            >
              Manage →
            </Link>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {Object.entries(VISIT_REASON_LABELS).map(([key, label]) => (
            <Link
              key={key}
              href="/checkin"
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-sm transition-all text-center"
            >
              <div className="text-2xl mb-2">{reasonIcon(key)}</div>
              <p className="text-xs font-medium text-gray-700">{label}</p>
            </Link>
          ))}
        </div>

        {/* Recent visits */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Visits</h2>
            <Link href="/logs" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {loadingLogs ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : recentLogs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">
              No visits yet. Head to Check In to get started!
            </p>
          ) : (
            <ul className="space-y-2">
              {recentLogs.map((log) => (
                <li
                  key={log.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{reasonIcon(log.visitReason)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {VISIT_REASON_LABELS[log.visitReason]}
                      </p>
                      <p className="text-xs text-gray-400">
                        {log.checkInTime.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {log.checkOutTime ? (
                    <span className="text-xs text-gray-400">Done</span>
                  ) : (
                    <span className="text-xs text-green-600 font-medium">
                      Active
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
  loading,
}: {
  label: string;
  value: string | number;
  icon: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        {loading ? (
          <div className="h-6 w-16 bg-gray-200 animate-pulse rounded mt-1" />
        ) : (
          <p className="text-xl font-bold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}

function reasonIcon(reason: string): string {
  switch (reason) {
    case "reading_research":
      return "📖";
    case "borrowed_books":
      return "📚";
    case "use_of_computers":
      return "💻";
    case "wifi_access":
      return "📶";
    default:
      return "🏛";
  }
}
