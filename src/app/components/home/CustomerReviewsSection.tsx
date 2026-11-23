"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Review = {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export default function CustomerReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchReviews() {
      try {
        const response = await fetch(`${API_URL}/api/reviews/`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load customer reviews.");
        }

        const data = await response.json();
        setReviews(data.reviews || []);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("Unable to load customer reviews.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchReviews();

    return () => controller.abort();
  }, []);

  return (
    <section className="border-t border-[var(--border-hairline)] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent-primary)]">
            Community Feedback
          </span>

          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            Customer Reviews
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center font-mono text-xs text-[var(--text-secondary)]">
            Loading customer reviews...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-sm text-[var(--text-secondary)]">
            {error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--text-secondary)]">
            No customer reviews yet. Be the first to share your experience!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="specular-card rounded-2xl p-6"
              >
                <div className="mb-5 flex items-center gap-1 text-[var(--accent-cyan)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < review.rating ? "currentColor" : "none"}
                      className={
                        i < review.rating ? "" : "text-[var(--text-secondary)]"
                      }
                    />
                  ))}

                  <span className="ml-2 font-mono text-xs text-[var(--text-secondary)]">
                    {review.rating}/5
                  </span>
                </div>

                <p className="min-h-24 text-sm leading-relaxed text-[var(--text-secondary)]">
                  “{review.comment}”
                </p>

                <div className="mt-6 border-t border-[var(--border-hairline)] pt-4">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    {review.customerName}
                  </h3>

                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Verified customer review
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
