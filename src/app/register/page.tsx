"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Lock,
  Mail,
  Sparkles,
  Upload,
  User,
  UserRound,
  BriefcaseBusiness,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

type UserRole = "customer" | "owner";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");

  const [showPassword, setShowPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasMinLength = password.length >= 6;


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!apiKey || apiKey === "your_imgbb_api_key_here") {
      setError("ImgBB API key is missing. Please use a direct image URL.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error("Image upload failed.");
      }

      setPhoto(data.data.display_url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

 
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!hasUppercase || !hasLowercase || !hasMinLength) {
      setError(
        "Password must have at least 1 uppercase letter, 1 lowercase letter, and 6+ characters.",
      );
      return;
    }

    if (uploading) {
      setError("Please wait for the profile photo upload to finish.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image: photo.trim() || undefined,
        role,
        callbackURL: "/dashboard",
      });

      if (error) {
        setError(error.message || "Registration failed. Please try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };


const handleGoogleSignUp = async () => {
  setError("");
  setLoading(true);

  try {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });

    if (error) {
      setError(error.message || "Google registration failed.");
      setLoading(false);
    }
  } catch {
    setError("Unable to continue with Google. Please try again.");
    setLoading(false);
  }
};

  return (
    <div className="relative flex min-h-[86vh] items-center justify-center px-4 py-14 architectural-grid">
      <div className="pointer-events-none absolute top-16 right-1/4 h-72 w-72 rounded-full bg-[var(--accent-cyan)]/15 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-16 left-1/4 h-72 w-72 rounded-full bg-[var(--accent-secondary)]/15 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl specular-card p-8 sm:p-9">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/10 px-3 py-1 font-mono text-[11px] font-medium text-[var(--accent-cyan)]">
          <Sparkles className="h-3 w-3" />
          <span>New Member Onboarding</span>
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          Create Aetheris Account
        </h1>

        <p className="mt-1 text-xs text-[var(--text-secondary)] mb-4">
          Register to rent calibrated equipment or manage your fleet.
        </p>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading || uploading}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-sm font-medium transition hover:border-[var(--accent-primary)] hover:bg-[var(--bg-canvas)] disabled:opacity-60"
        >
          <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.73 7.18l7.27 5.64c4.25-3.92 7.5-9.72 7.5-17.29Z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.12.75-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 2.56 10.78l7.97-6.19Z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.27-5.64c-2.02 1.35-4.6 2.15-8.63 2.15-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border-hairline)]" />
          <span className="font-mono text-[10px] text-[var(--text-secondary)]">
            OR REGISTER WITH EMAIL
          </span>
          <div className="h-px flex-1 bg-[var(--border-hairline)]" />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-medium">
              Full Name
            </label>

            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />

              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sora Takahashi"
                autoComplete="name"
                className="block h-11 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] pl-10 pr-4 text-sm outline-none transition focus:border-[var(--accent-primary)]"
              />
            </div>
          </div>

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sora@studio.io"
                autoComplete="email"
                className="block h-11 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] pl-10 pr-4 text-sm outline-none transition focus:border-[var(--accent-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">
              I want to join as
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${
                  role === "customer"
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                    : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/50"
                }`}
              >
                <UserRound className="h-4 w-4 shrink-0" />

                <span>
                  <span className="block text-xs font-semibold">Customer</span>
                  <span className="mt-0.5 block text-[10px] opacity-70">
                    Rent equipment
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${
                  role === "owner"
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                    : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/50"
                }`}
              >
                <BriefcaseBusiness className="h-4 w-4 shrink-0" />

                <span>
                  <span className="block text-xs font-semibold">Owner</span>
                  <span className="mt-0.5 block text-[10px] opacity-70">
                    List equipment
                  </span>
                </span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="photo" className="mb-1.5 block text-xs font-medium">
              Profile Photo (Direct URL or ImgBB Upload)
            </label>

            <div className="relative">
              <ImageIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />

              <input
                id="photo"
                type="url"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="https://i.ibb.co/your-avatar.jpg"
                className="block h-11 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] pl-10 pr-4 text-sm outline-none transition focus:border-[var(--accent-primary)]"
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--accent-primary)] transition hover:border-[var(--accent-primary)]">
                <Upload className="h-3.5 w-3.5" />

                <span>{uploading ? "Uploading..." : "Upload via ImgBB"}</span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {photo && (
                <img
                  src={photo}
                  alt="Avatar preview"
                  className="h-8 w-8 rounded-full border border-[var(--accent-primary)]/50 object-cover"
                />
              )}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                autoComplete="new-password"
                className="block h-11 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] pl-10 pr-10 text-sm outline-none transition focus:border-[var(--accent-primary)]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="mt-2.5 space-y-1 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)]/70 p-2.5 text-[11px]">
              <div
                className={`flex items-center gap-1.5 ${
                  hasUppercase
                    ? "text-emerald-400"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>At least 1 uppercase letter (A-Z)</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  hasLowercase
                    ? "text-emerald-400"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>At least 1 lowercase letter (a-z)</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  hasMinLength
                    ? "text-emerald-400"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Minimum 6 characters</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || uploading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#638df2] py-3 text-xs font-semibold text-[#0a0e14] shadow-lg shadow-[var(--accent-primary)]/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{loading ? "Creating Account..." : "Create Account"}</span>

            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--accent-primary)] hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
