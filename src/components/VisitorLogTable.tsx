"use client";

import type { VisitorLog } from "@/types";
import { VISIT_REASON_LABELS } from "@/types";

interface VisitorLogTableProps {
  logs: VisitorLog[];
  showUser?: boolean;
}

export default function VisitorLogTable({
  logs,
  showUser = false,
}: VisitorLogTableProps) {

  if (logs.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <svg
          className="w-12 h-12 mx-auto mb-3 opacity-40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-sm">No visit records found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            {showUser && (
              <>
                <th className="pb-3 pr-4 font-semibold text-gray-600">Name</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600">College</th>
              </>
            )}
            <th className="pb-3 pr-4 font-semibold text-gray-600">Reason</th>
            <th className="pb-3 pr-4 font-semibold text-gray-600">Check In</th>
            <th className="pb-3 pr-4 font-semibold text-gray-600">Check Out</th>
            <th className="pb-3 font-semibold text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
              {showUser && (
                <>
                  <td className="py-3 pr-4 text-gray-800">{log.userName}</td>
                  <td className="py-3 pr-4 text-gray-500 text-xs">
                    {log.college}
                  </td>
                </>
              )}
              <td className="py-3 pr-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${reasonBadge(log.visitReason)}`}
                >
                  {log.visitReason === "wifi_access" &&
                    log.wifiStatus === "flagged" && (
                      <span
                        title="Flagged for malicious activity"
                        className="text-red-600"
                      >
                        ⚠
                      </span>
                    )}
                  {VISIT_REASON_LABELS[log.visitReason]}
                </span>
              </td>
              <td className="py-3 pr-4 text-gray-600">
                {log.checkInTime.toLocaleString()}
              </td>
              <td className="py-3 pr-4 text-gray-600">
                {log.checkOutTime
                  ? log.checkOutTime.toLocaleString()
                  : <span className="text-gray-400">—</span>}
              </td>
              <td className="py-3">
                {log.checkOutTime ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Active
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function reasonBadge(reason: string): string {
  switch (reason) {
    case "reading_research":
      return "bg-purple-100 text-purple-700";
    case "borrowed_books":
      return "bg-yellow-100 text-yellow-700";
    case "use_of_computers":
      return "bg-blue-100 text-blue-700";
    case "wifi_access":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}
