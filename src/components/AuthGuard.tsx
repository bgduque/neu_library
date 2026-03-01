"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserPrivilege } from "@/types";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPrivileges?: UserPrivilege[];
}

export default function AuthGuard({
  children,
  requiredPrivileges,
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.isDisabled) {
      router.replace("/login?error=disabled");
      return;
    }
    if (
      requiredPrivileges &&
      !requiredPrivileges.includes(user.privilege)
    ) {
      router.replace("/dashboard?error=unauthorized");
    }
  }, [user, loading, router, requiredPrivileges]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;
  if (user.isDisabled) return null;
  if (requiredPrivileges && !requiredPrivileges.includes(user.privilege))
    return null;

  return <>{children}</>;
}
