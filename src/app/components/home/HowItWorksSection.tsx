"use client";

import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Find Your Equipment",
    description:
      "Browse approved equipment by category, location, or price. Explore the details and choose the equipment that fits your project.",
  },
  {
    step: "02",
    title: "Book & Pay Securely",
    description:
      "Choose your rental dates, submit your booking request, and complete your payment securely through Stripe Checkout.",
  },
  {
    step: "03",
    title: "Manage Your Rental",
    description:
      "Track your booking status and manage your rentals through your personal dashboard.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="border-y border-[var(--border-hairline)] bg-[var(--bg-surface)]/50 py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
       
        <div className="mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent-primary)]">
            Deployment Protocol
          </span>

          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            How It Works
          </h2>
        </div>

       
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.55 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {steps.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl specular-card p-6 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent-primary)]/50"
            >
              <span className="font-mono text-2xl font-bold text-[var(--accent-cyan)]">
                {item.step}
              </span>

              <h3 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
                {item.title}
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                {item.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
