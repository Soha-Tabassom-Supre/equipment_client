"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function ToastProvider() {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border border-[var(--accent-primary)]/40 bg-[#111722]/95 px-4 py-3 text-xs font-medium text-white shadow-2xl backdrop-blur-xl">
      {toast.type === "error" ? (
        <AlertCircle className="h-4 w-4 text-rose-400" />
      ) : (
        <CheckCircle2 className="h-4 w-4 text-[var(--accent-cyan)]" />
      )}
      <span>{toast.message}</span>
    </div>
  );
}
