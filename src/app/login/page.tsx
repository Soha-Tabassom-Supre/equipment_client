"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { useToast } from "@/app/components/home/ToastProvider";
import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestedRedirect = searchParams.get("redirect");

  const redirectPath =
    requestedRedirect?.startsWith("/") && !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : "/dashboard";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (error) {
         const message = error.message || "Invalid email or password.";
         setError(message);
         showToast(message, "error");
         return;
      }

      showToast("Login successful! Welcome back.", "success");
      router.push(redirectPath);
      router.refresh();
    } catch {
       const message = "Something went wrong. Please try again.";
       setError(message);
       showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${redirectPath}${redirectPath.includes("?") ? "&" : "?"}login=success`,
      });
    } catch {
      setError("Unable to sign in with Google. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-[86vh] items-center justify-center px-4 py-14 architectural-grid">
      <div className="pointer-events-none absolute top-16 right-1/4 h-72 w-72 rounded-full bg-[var(--accent-cyan)]/15 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-16 left-1/4 h-72 w-72 rounded-full bg-[var(--accent-secondary)]/15 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl specular-card p-8 sm:p-9">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/10 px-3 py-1 font-mono text-[11px] font-medium text-[var(--accent-cyan)]">
          <Sparkles className="h-3 w-3" />
          <span>JWT Session Gateway</span>
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          Sign in to Aetheris
        </h1>

        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Welcome back. Access your equipment rental workspace.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium">
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="soha@studio.io"
                className="block h-11 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] pl-10 pr-4 text-sm outline-none transition focus:border-[var(--accent-primary)]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-medium"
            >
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="block h-11 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] pl-10 pr-10 text-sm outline-none transition focus:border-[var(--accent-primary)]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#638df2] py-3 text-xs font-semibold text-[#0a0e14] shadow-lg shadow-[var(--accent-primary)]/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{loading ? "Signing In..." : "Sign In"}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-sm font-medium text-[var(--text-primary)] transition hover:opacity-80"
            >
              <svg viewBox="0 0 48 48" className="h-5 w-5">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 3.01 13.22l7.98 6.19C12.9 13.72 18.02 9.5 24 9.5Z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.96 46.98 31.88 46.98 24.55Z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.99 28.59A14.4 14.4 0 0 1 10.22 24c0-1.59.27-3.13.77-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 3.01 10.78l7.98-6.19Z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.94-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.89 2.3-8.18 2.3-5.98 0-11.1-4.22-12.99-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-[var(--accent-primary)] hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[86vh] items-center justify-center">
          <p className="text-xs text-[var(--text-secondary)]">Loading...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
