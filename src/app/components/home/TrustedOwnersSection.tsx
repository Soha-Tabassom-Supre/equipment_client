"use client";

import { motion } from "framer-motion";
import { Building2, ShieldCheck, PackageCheck } from "lucide-react";

const ownerBenefits = [
  {
    icon: Building2,
    number: "01",
    title: "For Equipment Owners",
    description:
      "List your equipment and make it available to customers looking for reliable rental solutions.",
  },
  {
    icon: ShieldCheck,
    number: "02",
    title: "Admin-Reviewed Listings",
    description:
      "Equipment listings are reviewed by administrators before becoming publicly available.",
  },
  {
    icon: PackageCheck,
    number: "03",
    title: "Manage Your Inventory",
    description:
      "Manage your equipment listings and keep track of rental requests from your owner dashboard.",
  },
];

export default function TrustedOwnersSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent-primary)]">
            Owner Network
          </span>

          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            Built for Equipment Owners
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
            Aetheris connects equipment owners with customers who need
            dependable equipment for their projects.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {ownerBenefits.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="specular-card group rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent-primary)]/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                    <Icon size={22} />
                  </div>

                  <span className="font-mono text-sm text-[var(--text-secondary)]">
                    {item.number}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-semibold text-[var(--text-primary)]">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
