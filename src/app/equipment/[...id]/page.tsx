"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import BookingModal from "@/app/components/BookingModal";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Heart,
  Layers,
  MapPin,
  Package,
  ShieldCheck,
} from "lucide-react";

type Equipment = {
  _id: string;
  name: string;
  description: string;
  category: string;
  pricePerDay: number;
  location: string;
  condition: string;
  images?: string[];
  status: string;
  createdAt: string;
};

export default function EquipmentDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const role = session?.user?.role;

  const [item, setItem] = useState<Equipment | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Protect the page
  useEffect(() => {
    if (!isPending && !session) {
      router.replace(`/login?redirect=/equipment/${id}`);
    }
  }, [isPending, session, id, router]);

  // Fetch equipment details
  useEffect(() => {
    const controller = new AbortController();

    async function fetchEquipment() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/equipment/${id}`,
          { signal: controller.signal },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Equipment not found.");
        }

        setItem(result.equipment || result);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error ? err.message : "Failed to load equipment.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (id) fetchEquipment();

    return () => controller.abort();
  }, [id]);

  // Check whether this equipment is already in customer favorites
  useEffect(() => {
    if (isPending || !session || role !== "customer") return;

    async function fetchFavorites() {
      try {
        const result = await apiFetch("/api/favorites");
        const favorites: Equipment[] = result.equipment || [];

        setIsFavorite(favorites.some((favorite) => favorite._id === id));
      } catch (err) {
        console.error("Failed to load favorites:", err);
      }
    }

    fetchFavorites();
  }, [isPending, session, role, id]);

  const handleFavorite = async () => {
    if (!item || favoriteLoading) return;

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        await apiFetch(`/api/favorites/${item._id}`, {
          method: "DELETE",
        });
        setIsFavorite(false);
      } else {
        await apiFetch(`/api/favorites/${item._id}`, {
          method: "POST",
        });
        setIsFavorite(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update favorites.",
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (isPending || !session) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center font-mono text-xs text-[var(--text-secondary)]">
        Verifying Session...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center font-mono text-xs text-[var(--text-secondary)]">
        Loading Equipment Details...
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Equipment Asset Not Found</h1>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">{error}</p>
        <Link
          href="/equipment"
          className="mt-6 inline-block rounded-xl bg-[var(--accent-primary)] px-5 py-2.5 text-xs font-semibold text-[#0a0e14]"
        >
          Back to All Equipment
        </Link>
      </div>
    );
  }

  if (!item) return null;

  const isCustomer = role === "customer";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/equipment"
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Equipment</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Equipment Image and Condition */}
        <div className="space-y-4 lg:col-span-6">
          <div className="relative overflow-hidden rounded-3xl specular-card">
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.name}
                className="h-[420px] w-full object-cover"
              />
            ) : (
              <div className="flex h-[420px] items-center justify-center bg-[var(--bg-elevated)]">
                <Package className="h-16 w-16 text-[var(--text-secondary)]" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14]/70 via-transparent to-transparent" />

            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-[#0a0e14]/80 px-3 py-1.5 font-mono text-xs text-[var(--accent-cyan)] backdrop-blur-md">
              <Layers className="h-3.5 w-3.5" />
              {item.category}
            </span>
          </div>

          <div className="rounded-2xl specular-card p-4 text-xs">
            <div className="text-[11px] text-[var(--text-secondary)]">
              Equipment Condition
            </div>
            <div className="mt-1 font-semibold text-emerald-400">
              {item.condition}
            </div>
          </div>
        </div>

        {/* Equipment Details */}
        <div className="space-y-6 lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs font-medium text-emerald-400">
              <Package className="h-3.5 w-3.5" />
              Approved Listing
            </span>

            <span className="inline-flex items-center gap-1 text-xs text-[var(--accent-primary)]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified Listing
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 rounded-2xl border border-[var(--accent-primary)]/25 bg-[var(--accent-primary)]/10 px-5 py-4">
            <span className="font-mono text-3xl font-bold text-[var(--accent-cyan)]">
              ${item.pricePerDay}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">/ day</span>
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-2 text-sm font-semibold">Description</h2>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {item.description}
            </p>
          </div>

          {/* Location and Condition */}
          <div className="grid grid-cols-1 gap-4 rounded-2xl specular-card p-4 text-xs sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-primary)]" />
              <div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  Equipment Location
                </div>
                <div className="mt-0.5 font-semibold">{item.location}</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-secondary)]" />
              <div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  Condition
                </div>
                <div className="mt-0.5 font-semibold">{item.condition}</div>
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-rose-500/10 p-3 text-xs text-rose-400">
              {error}
            </p>
          )}

          {/* Actions */}
          {isCustomer ? (
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#638df2] px-6 py-3.5 text-xs font-semibold text-[#0a0e14] shadow-lg shadow-[var(--accent-primary)]/20 transition hover:brightness-110"
              >
                <Calendar className="h-4 w-4" />
                <span>Book Now</span>
              </button>

              <button
                type="button"
                disabled={favoriteLoading}
                onClick={handleFavorite}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-5 py-3.5 text-xs font-semibold transition hover:border-[var(--accent-primary)] disabled:opacity-50"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorite ? "fill-rose-500 text-rose-500" : ""
                  }`}
                />
                <span>
                  {isFavorite ? "Saved in Favorites" : "Add to Favorites"}
                </span>
              </button>
            </div>
          ) : (
            <p className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 text-xs text-[var(--text-secondary)]">
              Booking and favorites are available to customer accounts.
            </p>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {modalOpen && (
        <BookingModal item={item} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
