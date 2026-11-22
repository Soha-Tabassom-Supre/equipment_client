"use client";

import React, { useCallback, useEffect, useState } from "react";
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
  Star,
  Trash2,
  Pencil,
  X,
} from "lucide-react";

type RentalType = "daily" | "weekly" | "monthly";

type Equipment = {
  _id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  rentalType: RentalType;
  rentalPrice: number;
  pricePerDay?: number;
  availableQuantity: number;
  rentalTerms: string;
  location: string;
  condition: string;
  images?: string[];
  status: string;
  createdAt: string;
};

type Review = {
  _id: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
};

type ReviewData = {
  totalReviews: number;
  averageRating: number;
  reviews: Review[];
};

export default function EquipmentDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const role = session?.user?.role;
  const currentUserId = session?.user?.id;

  const [item, setItem] = useState<Equipment | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const loadReviews = useCallback(async () => {
    try {
      setReviewLoading(true);
      setReviewError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${id}`,
      );

      const result: ReviewData = await response.json();

      if (!response.ok) {
        throw new Error("Failed to load reviews.");
      }

      setReviews(result.reviews || []);
      setAverageRating(result.averageRating || 0);
      setTotalReviews(result.totalReviews || 0);
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Failed to load reviews.",
      );
    } finally {
      setReviewLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace(`/login?redirect=/equipment/${id}`);
    }
  }, [isPending, session, id, router]);

useEffect(() => {
  const controller = new AbortController();

  async function fetchEquipment() {
    if (isPending || !session) return;

    try {
      setLoading(true);
      setError("");

      let result;

      if (role === "admin") {
        result = await apiFetch(`/api/admin/equipment/${id}`, {
          signal: controller.signal,
        });
      } else if (role === "owner") {
        result = await apiFetch(`/api/equipment/my-equipment/${id}`, {
          signal: controller.signal,
        });
      } else {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/equipment/${id}`,
          { signal: controller.signal },
        );

        result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Equipment not found.");
        }
      }

      const equipment = result.equipment || result;

      setItem({
        ...equipment,
        rentalPrice: Number(
          equipment.rentalPrice ?? equipment.pricePerDay ?? 0,
        ),
        rentalType: equipment.rentalType ?? "daily",
        availableQuantity: Number(equipment.availableQuantity ?? 0),
      });
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
}, [id, role, session, isPending]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (reviewSubmitting) return;

    try {
      setReviewSubmitting(true);
      setReviewError("");
      setReviewMessage("");

      await apiFetch(`/api/reviews/${id}`, {
        method: "POST",
        body: JSON.stringify({
          rating,
          comment,
        }),
      });

      setComment("");
      setRating(5);
      setReviewMessage("Your review was submitted successfully.");

      await loadReviews();
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Could not submit review.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const startEditingReview = (review: Review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setReviewError("");
    setReviewMessage("");
  };

  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingReviewId) return;

    try {
      setReviewSubmitting(true);
      setReviewError("");
      setReviewMessage("");

      await apiFetch(`/api/reviews/edit/${editingReviewId}`, {
        method: "PATCH",
        body: JSON.stringify({
          rating: editRating,
          comment: editComment,
        }),
      });

      setEditingReviewId(null);
      setReviewMessage("Your review was updated successfully.");

      await loadReviews();
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Could not update review.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete your review?")) {
      return;
    }

    try {
      setReviewError("");
      setReviewMessage("");

      await apiFetch(`/api/reviews/edit/${reviewId}`, {
        method: "DELETE",
      });

      setReviewMessage("Your review was deleted successfully.");
      await loadReviews();
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Could not delete review.",
      );
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
  const myReview = reviews.find(
    (review) => review.customerId === currentUserId,
  );

  const hasValidPrice =
    Number.isFinite(item.rentalPrice) && item.rentalPrice > 0;

  const hasAvailableQuantity =
    Number.isInteger(item.availableQuantity) && item.availableQuantity > 0;

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

        <div className="space-y-6 lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs font-medium text-emerald-400">
              <Package className="h-3.5 w-3.5" />
              {item.status.charAt(0).toUpperCase() +
                item.status.slice(1) +
                " Listing"}
            </span>

            <span className="inline-flex items-center gap-1 text-xs text-[var(--accent-primary)]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {item.status === "approved" && (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--accent-primary)]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified Listing
                </span>
              )}
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {item.brand} {item.model}
            </p>
          </div>

          <div className="flex items-baseline gap-2 rounded-2xl border border-[var(--accent-primary)]/25 bg-[var(--accent-primary)]/10 px-5 py-4">
            <span className="font-mono text-3xl font-bold text-[var(--accent-cyan)]">
              {hasValidPrice
                ? `৳${item.rentalPrice.toLocaleString("en-BD")}`
                : "Price unavailable"}
            </span>

            {hasValidPrice && (
              <span className="text-sm text-[var(--text-secondary)]">
                / {item.rentalType}
              </span>
            )}
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold">Description</h2>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {item.description}
            </p>
          </div>

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

          <div className="grid grid-cols-1 gap-4 rounded-2xl specular-card p-4 text-xs sm:grid-cols-2">
            <div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                Available Quantity
              </div>
              <div className="mt-1 font-semibold">
                {item.availableQuantity} units
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                Rental Type
              </div>
              <div className="mt-1 font-semibold capitalize">
                {item.rentalType}
              </div>
            </div>
          </div>

          {item.rentalTerms && (
            <div className="rounded-2xl specular-card p-4">
              <h2 className="mb-2 text-sm font-semibold">
                Rental Terms & Conditions
              </h2>
              <p className="whitespace-pre-line text-xs leading-relaxed text-[var(--text-secondary)]">
                {item.rentalTerms}
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-rose-500/10 p-3 text-xs text-rose-400">
              {error}
            </p>
          )}

          {isCustomer ? (
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                disabled={!hasAvailableQuantity || !hasValidPrice}
                onClick={() => setModalOpen(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#638df2] px-6 py-3.5 text-xs font-semibold text-[#0a0e14] shadow-lg shadow-[var(--accent-primary)]/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Calendar className="h-4 w-4" />
                <span>
                  {!hasAvailableQuantity
                    ? "Currently Unavailable"
                    : !hasValidPrice
                      ? "Price Unavailable"
                      : "Book Now"}
                </span>
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

      <section className="mt-16 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Feedback from customers who rented this equipment.
            </p>
          </div>

          <div className="rounded-2xl specular-card px-5 py-3">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="font-mono text-2xl font-bold">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
              {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
            </p>
          </div>
        </div>

        {isCustomer && !myReview && (
          <form
            onSubmit={handleSubmitReview}
            className="space-y-4 rounded-3xl specular-card p-6"
          >
            <h3 className="text-lg font-bold">Write a Review</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Reviews are available after completing a confirmed and paid
              rental.
            </p>

            <div>
              <label className="mb-2 block text-xs font-medium">
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="rounded-lg p-1 transition"
                    aria-label={`Rate ${value} out of 5`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        value <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-[var(--text-secondary)]"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium">
                Your Review
              </label>
              <textarea
                required
                minLength={1}
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this equipment..."
                className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 py-3 text-sm outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            {reviewError && (
              <p className="rounded-lg bg-rose-500/10 p-3 text-xs text-rose-400">
                {reviewError}
              </p>
            )}

            {reviewMessage && (
              <p className="rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-400">
                {reviewMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={reviewSubmitting || !comment.trim()}
              className="rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#638df2] px-6 py-3 text-xs font-semibold text-[#0a0e14] disabled:opacity-50"
            >
              {reviewSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {reviewError && !isCustomer && (
          <p className="rounded-lg bg-rose-500/10 p-3 text-xs text-rose-400">
            {reviewError}
          </p>
        )}

        {reviewLoading ? (
          <div className="rounded-2xl specular-card p-8 text-center text-xs text-[var(--text-secondary)]">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl specular-card p-8 text-center text-xs text-[var(--text-secondary)]">
            No reviews yet. Be the first to share your experience after a
            completed rental.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const isMyReview = review.customerId === currentUserId;

              return (
                <article
                  key={review._id}
                  className="rounded-2xl specular-card p-5 sm:p-6"
                >
                  {editingReviewId === review._id ? (
                    <form onSubmit={handleUpdateReview} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Edit Your Review</h3>
                        <button
                          type="button"
                          onClick={() => setEditingReviewId(null)}
                          className="text-[var(--text-secondary)] hover:text-rose-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setEditRating(value)}
                            aria-label={`Rate ${value} out of 5`}
                          >
                            <Star
                              className={`h-5 w-5 ${
                                value <= editRating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-[var(--text-secondary)]"
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      <textarea
                        required
                        rows={3}
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 py-3 text-sm outline-none focus:border-[var(--accent-primary)]"
                      />

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={reviewSubmitting || !editComment.trim()}
                          className="rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-xs font-semibold text-[#0a0e14] disabled:opacity-50"
                        >
                          {reviewSubmitting ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingReviewId(null)}
                          className="rounded-lg border border-[var(--border-hairline)] px-4 py-2 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold">
                            {review.customerName}
                          </h3>
                          <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, index) => (
                            <Star
                              key={index}
                              className={`h-4 w-4 ${
                                index < review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-[var(--text-secondary)]"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                        {review.comment}
                      </p>

                      {isMyReview && (
                        <div className="mt-4 flex gap-2 border-t border-[var(--border-hairline)] pt-4">
                          <button
                            type="button"
                            onClick={() => startEditingReview(review)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] px-3 py-2 text-xs hover:border-[var(--accent-primary)]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteReview(review._id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {reviewMessage && myReview && (
          <p className="rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-400">
            {reviewMessage}
          </p>
        )}

        {reviewError && myReview && (
          <p className="rounded-lg bg-rose-500/10 p-3 text-xs text-rose-400">
            {reviewError}
          </p>
        )}
      </section>

      {modalOpen && (
        <BookingModal item={item} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
