import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center architectural-grid">
      <span className="rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-[var(--accent-primary)]">
        Error 404 • Route Unmapped
      </span>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">
        Vault Coordinates Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-[var(--text-secondary)]">
        The equipment asset or route you requested does not exist or has been
        decommissioned.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#638df2] px-6 py-3 text-xs font-semibold text-[#0a0e14] transition hover:brightness-110"
      >
        Return to Marketplace
      </Link>
    </div>
  );
}
