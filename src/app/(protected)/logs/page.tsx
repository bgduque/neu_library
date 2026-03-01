"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import VisitorLogTable from "@/components/VisitorLogTable";
import { getUserLogs } from "@/lib/firestore";
import type { VisitorLog } from "@/types";

export default function LogsPage() {
  return (
    <AuthGuard>
      <LogsContent />
    </AuthGuard>
  );
}

function LogsContent() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserLogs(user.uid).then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, [user]);

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Visit Logs</h1>
        <div className="bg-white rounded-2xl shadow p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <VisitorLogTable logs={logs} />
          )}
        </div>
      </main>
    </>
  );
}
