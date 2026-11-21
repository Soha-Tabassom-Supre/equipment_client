import Link from "next/link";
import { Hexagon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-hairline)] bg-[var(--bg-surface)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-[#0a0e14]">
                <Hexagon className="h-4 w-4 stroke-[2.2]" />
              </div>

              <span className="text-lg font-bold tracking-tight">
                AETHER<span className="text-[var(--accent-primary)]">IS</span>
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Precision equipment rental infrastructure for cinema crews,
              surveyors, engineers, and live production architects.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider">
              Marketplace
            </h4>

            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <Link
                  href="/equipment"
                  className="hover:text-[var(--accent-primary)]"
                >
                  All Equipment
                </Link>
              </li>

              <li>
                <Link
                  href="/#categories"
                  className="hover:text-[var(--accent-primary)]"
                >
                  Categories
                </Link>
              </li>

              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-[var(--accent-primary)]"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider">
              Account &amp; Roles
            </h4>

            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <Link
                  href="/login"
                  className="hover:text-[var(--accent-primary)]"
                >
                  Sign In
                </Link>
              </li>

              <li>
                <Link
                  href="/register"
                  className="hover:text-[var(--accent-primary)]"
                >
                  Create Account
                </Link>
              </li>

              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-[var(--accent-primary)]"
                >
                  Role Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider">
              Connect
            </h4>

            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[var(--border-hairline)] pt-6 text-xs text-[var(--text-secondary)] sm:flex-row">
          <span>© 2026 Aetheris. All rights reserved.</span>
          <span className="font-mono">Equipment Rental Marketplace</span>
        </div>
      </div>
    </footer>
  );
}
