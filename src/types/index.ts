export type UserPrivilege = "highest" | "higher" | "high" | "mid" | "least";

export type VisitReason =
  | "reading_research"
  | "borrowed_books"
  | "use_of_computers"
  | "wifi_access";

export type WifiStatus = "normal" | "flagged";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  privilege: UserPrivilege;
  college: string | null;
  firstVisitCompleted: boolean;
  isDisabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisitorLog {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  college: string;
  visitReason: VisitReason;
  wifiStatus?: WifiStatus;
  notes?: string;
  checkInTime: Date;
  checkOutTime?: Date | null;
  createdAt: Date;
}

export interface DashboardStats {
  totalVisitsToday: number;
  totalVisitsThisMonth: number;
  totalUsers: number;
  visitsByReason: Record<VisitReason, number>;
  visitsByCollege: Record<string, number>;
  flaggedWifiSessions: number;
}

export const VISIT_REASON_LABELS: Record<VisitReason, string> = {
  reading_research: "Reading / Research",
  borrowed_books: "Borrowed Books",
  use_of_computers: "Use of Computers",
  wifi_access: "Access of Premise WiFi",
};

export const PRIVILEGE_LABELS: Record<UserPrivilege, string> = {
  highest: "Super Admin (CSD)",
  higher: "Senior Admin",
  high: "Admin",
  mid: "Faculty",
  least: "Student",
};

export const NEU_COLLEGES = [
  "College of Computing and Information Technologies (CCIT)",
  "College of Engineering and Architecture (CEA)",
  "College of Business Administration (CBA)",
  "College of Arts and Sciences (CAS)",
  "College of Education (COEd)",
  "College of Health Sciences (CHS)",
  "College of Law (COL)",
  "College of Nursing (CON)",
  "Graduate Studies",
  "Senior High School",
  "Basic Education",
  "Library Office",
  "Registrar's Office",
  "Finance Office",
  "Human Resources",
  "IT Department (CSD)",
  "Student Affairs Office",
  "Other Office / Department",
];

export const ADMIN_PRIVILEGES: UserPrivilege[] = [
  "highest",
  "higher",
  "high",
];
