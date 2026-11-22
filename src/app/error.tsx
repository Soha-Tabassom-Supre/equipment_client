"use client";

import React from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
      <span className="font-mono text-xs uppercase tracking-widest text-rose-400">
        Runtime Fault Detected
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-xs text-[var(--text-secondary)]">
        {error?.message || "An unexpected client error occurred."}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-[var(--accent-primary)] px-5 py-2.5 text-xs font-semibold text-[#0a0e14]"
        >
          Retry View
        </button>
        <Link
          href="/"
          className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-5 py-2.5 text-xs font-semibold"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
