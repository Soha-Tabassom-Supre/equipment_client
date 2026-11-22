"use client";

import React, { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login?redirect=/dashboard");
    }
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center font-mono text-xs text-[var(--text-secondary)]">
        Verifying Role-Based Access Control...
      </div>
    );
  }

  return <div className="w-full">{children}</div>;
}
