export default function Loading() {
  return (
    <div className="flex min-h-[72vh] flex-col items-center justify-center gap-4">
      <div className="h-11 w-11 animate-spin rounded-full border-2 border-[var(--accent-primary)]/25 border-t-[var(--accent-primary)]" />
      <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)]">
        Synchronizing Fleet Telemetry...
      </p>
    </div>
  );
}
