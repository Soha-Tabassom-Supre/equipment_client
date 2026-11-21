"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";


const reviews = [
  {
    name: "Alex Morgan",
    role: "Photography Customer",
    quote:
      "The booking process was straightforward, and I could easily find equipment that matched my photography needs.",
  },
  {
    name: "Daniel Carter",
    role: "Construction Customer",
    quote:
      "Having different equipment options in one place made planning my project much easier.",
  },
  {
    name: "Sarah Williams",
    role: "Event Organizer",
    quote:
      "The platform made it convenient to explore rental options and manage my booking.",
  },
  {
    name: "Michael Chen",
    role: "Equipment Owner",
    quote:
      "The owner dashboard provides a simple way to manage equipment listings and rental requests.",
  },
];

export default function CustomerReviewsSection() {
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="specular-card rounded-2xl p-6"
            >
              <div className="mb-5 flex gap-1 text-[var(--accent-cyan)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>

              <p className="min-h-24 text-sm leading-relaxed text-[var(--text-secondary)]">
                “{review.quote}”
              </p>

              <div className="mt-6 border-t border-[var(--border-hairline)] pt-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {review.name}
                </h3>

                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {review.role}
                </p>
                <span className="mt-2 inline-block font-mono text-[10px] uppercase tracking-wider text-[var(--accent-primary)]">
                  Demo Review
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      

    </section>
  );
}
