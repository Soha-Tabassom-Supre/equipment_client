"use client";
import React, { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/app/components/home/ToastProvider";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login?redirect=/dashboard");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.get("login") === "success") {
      showToast("Google login successful! Welcome back.", "success");

      url.searchParams.delete("login");
      router.replace(url.pathname + url.search + url.hash);
    }
  }, [router, showToast]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center font-mono text-xs text-[var(--text-secondary)]">
        Verifying Role-Based Access Control...
      </div>
    );
  }

  return <div className="w-full">{children}</div>;
}
