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
  const role = session?.user.role;

  const [item, setItem] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);


  useEffect(() => {
    const controller = new AbortController();

    async function fetchEquipment() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        if (!API_URL) {
          throw new Error("API URL is missing.");
        }

        const response = await fetch(`${API_URL}/api/equipment/${id}`, {
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load equipment details.",
          );
        }

        const equipment = result.equipment || result;

        if (!equipment._id) {
          throw new Error("Equipment details were not found.");
        }

        setItem(equipment);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchEquipment();

    return () => controller.abort();
  }, [id]);

 
  useEffect(() => {
    if (isPending || role !== "customer") return;

    async function fetchFavoriteStatus() {
      try {
        const result = await apiFetch("/api/favorites");

        const favorites = result.equipment || [];

        setIsFavorite(
          favorites.some((favorite: Equipment) => favorite._id === id),
        );
      } catch (err) {
        console.error("Failed to load favorite status:", err);
      }
    }

    fetchFavoriteStatus();
  }, [id, role, isPending]);

  const handleFavorite = async () => {
    if (!session) {
      router.push(`/login?redirect=/equipment/${id}`);
      return;
    }

    if (role !== "customer") return;

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        await apiFetch(`/api/favorites/${id}`, {
          method: "DELETE",
        });

        setIsFavorite(false);
      } else {
        await apiFetch(`/api/favorites/${id}`, {
          method: "POST",
        });

        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Favorite action failed:", err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleBooking = () => {
    if (!session) {
      router.push(`/login?redirect=/equipment/${id}`);
      return;
    }

    if (role !== "customer") return;

    setModalOpen(true);
  };

  if (loading || isPending) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center font-mono text-xs text-[var(--text-secondary)]">
        Loading Equipment Details...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Equipment Asset Not Found</h1>

        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          {error ||
            "The requested equipment does not exist or is no longer available."}
        </p>

        <Link
          href="/equipment"
          className="mt-6 inline-block rounded-xl bg-[var(--accent-primary)] px-5 py-2.5 text-xs font-semibold text-[#0a0e14]"
        >
          Back to All Equipment
        </Link>
      </div>
    );
  }

  const canBook = role === "customer";
  const canFavorite = role === "customer";
  const image = item.images?.[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
     
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

        <div className="space-y-4 lg:col-span-6">
          <div className="relative overflow-hidden rounded-3xl specular-card">
            {image ? (
              <img
                src={image}
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


          <div className="grid grid-cols-2 gap-3 rounded-2xl specular-card p-4 text-xs">
            <div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                Category
              </div>
              <div className="mt-0.5 font-semibold">{item.category}</div>
            </div>

            <div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                Condition
              </div>
              <div className="mt-0.5 font-semibold text-emerald-400">
                {item.condition}
              </div>
            </div>
          </div>
        </div>


        <div className="space-y-6 lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs font-medium text-emerald-400">
              <Package className="h-3.5 w-3.5" />
              Approved Listing
            </span>

            <span className="inline-flex items-center gap-1 text-xs text-[var(--accent-primary)]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{item.status}</span>
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>


          <div className="flex items-baseline gap-2 rounded-2xl border border-[var(--accent-primary)]/25 bg-[var(--accent-primary)]/10 px-5 py-4">
            <span className="font-mono text-3xl font-bold text-[var(--accent-cyan)]">
              ${item.pricePerDay}
            </span>

            <span className="text-sm text-[var(--text-secondary)]">/ day</span>
          </div>


          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            {item.description}
          </p>

       
          <div className="rounded-2xl specular-card p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-primary)]" />

              <div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  Equipment Location
                </div>

                <div className="mt-0.5 font-semibold">{item.location}</div>
              </div>
            </div>
          </div>

         
          <div className="rounded-2xl specular-card p-4 text-xs">
            <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-[var(--accent-cyan)]">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Listing</span>
            </div>

            <p className="leading-relaxed text-[var(--text-secondary)]">
              This equipment listing has been approved and is available for
              booking requests. The owner must confirm your request before
              payment.
            </p>
          </div>

        
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={handleBooking}
              disabled={!!session && !canBook}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#638df2] px-6 py-3.5 text-xs font-semibold text-[#0a0e14] shadow-lg shadow-[var(--accent-primary)]/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Calendar className="h-4 w-4" />

              <span>
                {!session
                  ? "Sign In to Book"
                  : canBook
                    ? "Book Now"
                    : "Customer Access Only"}
              </span>
            </button>

            {canFavorite && (
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
                  {favoriteLoading
                    ? "Updating..."
                    : isFavorite
                      ? "Saved in Favorites"
                      : "Add to Favorites"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <BookingModal item={item} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
