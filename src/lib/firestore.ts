import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  UserProfile,
  UserPrivilege,
  VisitorLog,
  DashboardStats,
  VisitReason,
} from "@/types";

// ── User Profile ─────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
  } as UserProfile;
}

export async function createUserProfile(
  profile: Omit<UserProfile, "createdAt" | "updatedAt">
): Promise<void> {
  const ref = doc(db, "users", profile.uid);
  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function setUserPrivilege(
  uid: string,
  privilege: UserPrivilege
): Promise<void> {
  await updateUserProfile(uid, { privilege });
}

export async function disableUser(uid: string): Promise<void> {
  await updateUserProfile(uid, { isDisabled: true });
}

export async function enableUser(uid: string): Promise<void> {
  await updateUserProfile(uid, { isDisabled: false });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as UserProfile;
  });
}

// ── Visitor Logs ──────────────────────────────────────────────────────────────

export async function createVisitorLog(
  log: Omit<VisitorLog, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "visitor_logs"), {
    ...log,
    checkInTime: Timestamp.fromDate(log.checkInTime),
    checkOutTime: log.checkOutTime
      ? Timestamp.fromDate(log.checkOutTime)
      : null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function checkOutVisitorLog(logId: string): Promise<void> {
  const ref = doc(db, "visitor_logs", logId);
  await updateDoc(ref, {
    checkOutTime: serverTimestamp(),
  });
}

export async function getActiveLog(userId: string): Promise<VisitorLog | null> {
  const q = query(
    collection(db, "visitor_logs"),
    where("userId", "==", userId),
    where("checkOutTime", "==", null),
    orderBy("checkInTime", "desc"),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data();
  return {
    id: d.id,
    ...data,
    checkInTime: (data.checkInTime as Timestamp).toDate(),
    checkOutTime: data.checkOutTime
      ? (data.checkOutTime as Timestamp).toDate()
      : null,
    createdAt: (data.createdAt as Timestamp).toDate(),
  } as VisitorLog;
}

export async function getUserLogs(userId: string): Promise<VisitorLog[]> {
  const q = query(
    collection(db, "visitor_logs"),
    where("userId", "==", userId),
    orderBy("checkInTime", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      checkInTime: (data.checkInTime as Timestamp).toDate(),
      checkOutTime: data.checkOutTime
        ? (data.checkOutTime as Timestamp).toDate()
        : null,
      createdAt: (data.createdAt as Timestamp).toDate(),
    } as VisitorLog;
  });
}

export async function getAllLogsToday(): Promise<VisitorLog[]> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const q = query(
    collection(db, "visitor_logs"),
    where("checkInTime", ">=", Timestamp.fromDate(startOfDay)),
    orderBy("checkInTime", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      checkInTime: (data.checkInTime as Timestamp).toDate(),
      checkOutTime: data.checkOutTime
        ? (data.checkOutTime as Timestamp).toDate()
        : null,
      createdAt: (data.createdAt as Timestamp).toDate(),
    } as VisitorLog;
  });
}

export async function getAllLogsThisMonth(): Promise<VisitorLog[]> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const q = query(
    collection(db, "visitor_logs"),
    where("checkInTime", ">=", Timestamp.fromDate(startOfMonth)),
    orderBy("checkInTime", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      checkInTime: (data.checkInTime as Timestamp).toDate(),
      checkOutTime: data.checkOutTime
        ? (data.checkOutTime as Timestamp).toDate()
        : null,
      createdAt: (data.createdAt as Timestamp).toDate(),
    } as VisitorLog;
  });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [todayLogs, monthLogs, users] = await Promise.all([
    getAllLogsToday(),
    getAllLogsThisMonth(),
    getAllUsers(),
  ]);

  const visitsByReason = {
    reading_research: 0,
    borrowed_books: 0,
    use_of_computers: 0,
    wifi_access: 0,
  } as Record<VisitReason, number>;

  const visitsByCollege: Record<string, number> = {};
  let flaggedWifiSessions = 0;

  for (const log of monthLogs) {
    visitsByReason[log.visitReason] = (visitsByReason[log.visitReason] || 0) + 1;
    visitsByCollege[log.college] = (visitsByCollege[log.college] || 0) + 1;
    if (log.visitReason === "wifi_access" && log.wifiStatus === "flagged") {
      flaggedWifiSessions++;
    }
  }

  return {
    totalVisitsToday: todayLogs.length,
    totalVisitsThisMonth: monthLogs.length,
    totalUsers: users.length,
    visitsByReason,
    visitsByCollege,
    flaggedWifiSessions,
  };
}
