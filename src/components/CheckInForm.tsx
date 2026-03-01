"use client";

import { useState } from "react";
import { createVisitorLog, checkOutVisitorLog } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import type { VisitReason, VisitorLog } from "@/types";
import { VISIT_REASON_LABELS } from "@/types";

interface CheckInFormProps {
  activeLog: VisitorLog | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

export default function CheckInForm({
  activeLog,
  onCheckIn,
  onCheckOut,
}: CheckInFormProps) {
  const { user } = useAuth();
  const [visitReason, setVisitReason] = useState<VisitReason | "">("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitReason) {
      setError("Please select a reason for your visit.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createVisitorLog({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        college: user.college ?? "Unknown",
        visitReason: visitReason as VisitReason,
        wifiStatus:
          visitReason === "wifi_access" ? "normal" : undefined,
        notes: notes.trim() || undefined,
        checkInTime: new Date(),
        checkOutTime: null,
      });
      setVisitReason("");
      setNotes("");
      onCheckIn();
    } catch {
      setError("Failed to check in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activeLog?.id) return;
    setSubmitting(true);
    setError("");
    try {
      await checkOutVisitorLog(activeLog.id);
      onCheckOut();
    } catch {
      setError("Failed to check out. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (activeLog) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          </span>
          <div>
            <h3 className="font-semibold text-gray-900">Currently Checked In</h3>
            <p className="text-sm text-gray-500">
              {VISIT_REASON_LABELS[activeLog.visitReason]} &middot;{" "}
              {activeLog.checkInTime.toLocaleTimeString()}
            </p>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button
          onClick={handleCheckOut}
          disabled={submitting}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {submitting ? "Checking out…" : "Check Out"}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="font-semibold text-gray-900 mb-4 text-lg">Check In</h3>
      <form onSubmit={handleCheckIn} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Visit
          </label>
          <div className="grid grid-cols-1 gap-2">
            {(Object.entries(VISIT_REASON_LABELS) as [VisitReason, string][]).map(
              ([key, label]) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    visitReason === key
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="visitReason"
                    value={key}
                    checked={visitReason === key}
                    onChange={() => setVisitReason(key)}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {label}
                  </span>
                </label>
              )
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Add any notes about your visit…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !visitReason}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {submitting ? "Checking in…" : "Check In"}
        </button>
      </form>
    </div>
  );
}
