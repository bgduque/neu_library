"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import CheckInForm from "@/components/CheckInForm";
import FirstTimeVisitModal from "@/components/FirstTimeVisitModal";
import { getActiveLog } from "@/lib/firestore";
import type { VisitorLog } from "@/types";

export default function CheckInPage() {
  return (
    <AuthGuard>
      <CheckInContent />
    </AuthGuard>
  );
}

function CheckInContent() {
  const { user } = useAuth();
  const [activeLog, setActiveLog] = useState<VisitorLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const log = await getActiveLog(user.uid);
      if (cancelled) return;
      setActiveLog(log);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const reload = () => {
    if (!user) return;
    setLoading(true);
    getActiveLog(user.uid).then((log) => {
      setActiveLog(log);
      setLoading(false);
    });
  };

  return (
    <>
      <Navbar />
      <FirstTimeVisitModal />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Check In / Out</h1>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <CheckInForm
            activeLog={activeLog}
            onCheckIn={reload}
            onCheckOut={reload}
          />
        )}
      </main>
    </>
  );
}
