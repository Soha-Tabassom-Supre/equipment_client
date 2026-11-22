"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

function PaymentSuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <div className="mx-auto flex min-h-[72vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="w-full rounded-3xl specular-card p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Payment Submitted</h1>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          Your payment was submitted to Stripe. Your booking payment status will
          update after server verification.
        </p>

        <div className="mt-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3 font-mono text-xs text-[var(--accent-cyan)]">
          Stripe Session ID: {sessionId || "Session ID unavailable"}
        </div>

        <Link
          href="/bookings"
          className="mt-6 block w-full rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#638df2] py-3 text-xs font-semibold text-[#0a0e14]"
        >
          View My Rentals in Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center font-mono text-xs text-[var(--text-secondary)]">
          Loading Receipt...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
