"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import VisitorLogTable from "@/components/VisitorLogTable";
import {
  getDashboardStats,
  getAllLogsToday,
  getAllUsers,
  setUserPrivilege,
  disableUser,
  enableUser,
} from "@/lib/firestore";
import type {
  DashboardStats,
  VisitorLog,
  UserProfile,
  UserPrivilege,
} from "@/types";
import { VISIT_REASON_LABELS, PRIVILEGE_LABELS, ADMIN_PRIVILEGES } from "@/types";

export default function AdminPage() {
  return (
    <AuthGuard requiredPrivileges={ADMIN_PRIVILEGES}>
      <AdminContent />
    </AuthGuard>
  );
}

function AdminContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayLogs, setTodayLogs] = useState<VisitorLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "logs" | "users">("overview");
  const [userSearch, setUserSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const [s, logs, allUsers] = await Promise.all([
        getDashboardStats(),
        getAllLogsToday(),
        getAllUsers(),
      ]);
      if (cancelled) return;
      setStats(s);
      setTodayLogs(logs);
      setUsers(allUsers);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const reload = () => setRefreshKey((k) => k + 1);

  const handlePrivilegeChange = async (
    uid: string,
    privilege: UserPrivilege
  ) => {
    await setUserPrivilege(uid, privilege);
    reload();
  };

  const handleToggleDisable = async (u: UserProfile) => {
    if (u.isDisabled) {
      await enableUser(u.uid);
    } else {
      await disableUser(u.uid);
    }
    reload();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.college ?? "").toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Library management and analytics
            </p>
          </div>
          <button
            onClick={reload}
            className="text-sm text-blue-600 hover:underline"
          >
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          {(["overview", "logs", "users"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Overview */}
            {tab === "overview" && stats && (
              <div className="space-y-6">
                {/* Stats cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <AdminStatCard
                    label="Visits Today"
                    value={stats.totalVisitsToday}
                    color="blue"
                  />
                  <AdminStatCard
                    label="Visits This Month"
                    value={stats.totalVisitsThisMonth}
                    color="green"
                  />
                  <AdminStatCard
                    label="Registered Users"
                    value={stats.totalUsers}
                    color="purple"
                  />
                  <AdminStatCard
                    label="Flagged WiFi Sessions"
                    value={stats.flaggedWifiSessions}
                    color="red"
                  />
                </div>

                {/* Visit breakdown */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Visits by Reason (This Month)
                    </h3>
                    <div className="space-y-3">
                      {(
                        Object.entries(stats.visitsByReason) as [
                          string,
                          number
                        ][]
                      ).map(([reason, count]) => (
                        <div key={reason} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">
                                {
                                  VISIT_REASON_LABELS[
                                    reason as keyof typeof VISIT_REASON_LABELS
                                  ]
                                }
                              </span>
                              <span className="font-medium text-gray-800">
                                {count}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full">
                              <div
                                className="h-2 bg-blue-500 rounded-full"
                                style={{
                                  width: `${
                                    stats.totalVisitsThisMonth > 0
                                      ? (count /
                                          stats.totalVisitsThisMonth) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Visits by College (This Month)
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {Object.entries(stats.visitsByCollege)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([college, count]) => (
                          <div
                            key={college}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-600 truncate pr-2">
                              {college}
                            </span>
                            <span className="font-medium text-gray-800 shrink-0">
                              {count}
                            </span>
                          </div>
                        ))}
                      {Object.keys(stats.visitsByCollege).length === 0 && (
                        <p className="text-gray-400 text-sm">No data yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Today's Logs */}
            {tab === "logs" && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Today&apos;s Visitor Logs
                </h2>
                <VisitorLogTable logs={todayLogs} showUser />
              </div>
            )}

            {/* Users */}
            {tab === "users" && (
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                  <h2 className="font-semibold text-gray-900">
                    Registered Users
                  </h2>
                  <input
                    type="search"
                    placeholder="Search by name, email, or college…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left">
                        <th className="pb-3 pr-4 font-semibold text-gray-600">
                          Name
                        </th>
                        <th className="pb-3 pr-4 font-semibold text-gray-600">
                          Email
                        </th>
                        <th className="pb-3 pr-4 font-semibold text-gray-600">
                          College
                        </th>
                        <th className="pb-3 pr-4 font-semibold text-gray-600">
                          Privilege
                        </th>
                        <th className="pb-3 font-semibold text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((u) => (
                        <tr
                          key={u.uid}
                          className={`hover:bg-gray-50 ${u.isDisabled ? "opacity-50" : ""}`}
                        >
                          <td className="py-3 pr-4 text-gray-800">
                            {u.displayName}
                            {u.isDisabled && (
                              <span className="ml-1 text-xs text-red-500">
                                (disabled)
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-gray-500 text-xs">
                            {u.email}
                          </td>
                          <td className="py-3 pr-4 text-gray-500 text-xs">
                            {u.college ?? "—"}
                          </td>
                          <td className="py-3 pr-4">
                            <select
                              value={u.privilege}
                              onChange={(e) =>
                                handlePrivilegeChange(
                                  u.uid,
                                  e.target.value as UserPrivilege
                                )
                              }
                              className="text-xs border border-gray-200 rounded px-1 py-0.5"
                            >
                              {(
                                Object.entries(PRIVILEGE_LABELS) as [
                                  UserPrivilege,
                                  string
                                ][]
                              ).map(([key, label]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => handleToggleDisable(u)}
                              className={`text-xs font-medium ${
                                u.isDisabled
                                  ? "text-green-600 hover:text-green-800"
                                  : "text-red-500 hover:text-red-700"
                              }`}
                            >
                              {u.isDisabled ? "Enable" : "Disable"}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-gray-400 text-sm"
                          >
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

function AdminStatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "blue" | "green" | "purple" | "red";
}) {
  const colorMap = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    red: "bg-red-50 border-red-200 text-red-700",
  };
  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70 mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
