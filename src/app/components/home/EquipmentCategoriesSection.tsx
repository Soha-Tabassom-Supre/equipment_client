"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Camera,
  Construction,
  CarFront,
  Sprout,
  Cpu,
  PartyPopper,
  Sofa,
  Dumbbell,
  Wrench,
  Package,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Category = {
  name: string;
  count: number;
};

const categoryStyles = [
  { icon: Construction, accent: "#7aa2f7" },
  { icon: Camera, accent: "#9d7cd8" },
  { icon: CarFront, accent: "#7dcfff" },
  { icon: Sprout, accent: "#9ece6a" },
  { icon: Cpu, accent: "#e0af68" },
  { icon: PartyPopper, accent: "#f7768e" },
  { icon: Sofa, accent: "#bb9af7" },
  { icon: Dumbbell, accent: "#ff9e64" },
  { icon: Wrench, accent: "#73daca" },
  { icon: Package, accent: "#f7768e" },
];

function getCategoryStyle(name: string) {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes("construction")) {
    return categoryStyles[0];
  }
  if (
    normalizedName.includes("photography") ||
    normalizedName.includes("camera")
  ) {
    return categoryStyles[1];
  }
  if (normalizedName.includes("vehicle") || normalizedName.includes("car")) {
    return categoryStyles[2];
  }
  if (
    normalizedName.includes("agriculture") ||
    normalizedName.includes("farm")
  ) {
    return categoryStyles[3];
  }
  if (normalizedName.includes("electronic")) {
    return categoryStyles[4];
  }
  if (normalizedName.includes("event")) {
    return categoryStyles[5];
  }
  if (normalizedName.includes("furniture")) {
    return categoryStyles[6];
  }
  if (normalizedName.includes("sport")) {
    return categoryStyles[7];
  }
  if (normalizedName.includes("tool")) {
    return categoryStyles[8];
  }

  return categoryStyles[9];
}

export default function EquipmentCategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCategories() {
      try {
        const response = await fetch(`${API_URL}/api/equipment/categories`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load equipment categories.");
        }

        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("Unable to load equipment categories.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchCategories();

    return () => controller.abort();
  }, []);

  return (
    <section
      id="categories"
      className="relative overflow-hidden border-y border-[var(--border-hairline)] bg-[var(--bg-surface)]"
    >
      <div className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-[#7aa2f7]/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#7aa2f7]">
              Explore The Collection
            </span>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Equipment Categories
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
              Explore a wide range of equipment categories and find the right
              tools for your next project.
            </p>
          </div>

          <Link
            href="/equipment"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#7aa2f7] transition hover:gap-3"
          >
            Browse All Equipment
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center font-mono text-xs text-[var(--text-secondary)]">
            Loading equipment categories...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-sm text-[var(--text-secondary)]">
            {error}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--text-secondary)]">
            No equipment categories available yet.
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.09 },
              },
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {categories.map((category) => {
              const style = getCategoryStyle(category.name);
              const Icon = style.icon;

              return (
                <motion.div
                  key={category.name}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: "easeOut" },
                    },
                  }}
                >
                  <Link
                    href={`/equipment?category=${encodeURIComponent(category.name)}`}
                    className="group relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-2xl specular-card p-6 transition duration-300 hover:-translate-y-1 hover:border-[#7aa2f7]/50"
                  >
                    <div
                      className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 blur-3xl transition duration-500 group-hover:opacity-20"
                      style={{ backgroundColor: style.accent }}
                    />

                    <div className="relative flex items-start justify-between">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl border"
                        style={{
                          color: style.accent,
                          borderColor: `${style.accent}35`,
                          backgroundColor: `${style.accent}12`,
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <span className="font-mono text-xs text-[var(--text-secondary)]">
                        {String(category.count).padStart(2, "0")} ITEMS
                      </span>
                    </div>

                    <div className="relative mt-8 flex items-end justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] transition group-hover:text-[#7aa2f7]">
                          {category.name}
                        </h3>

                        <p className="mt-2 max-w-xs text-xs leading-6 text-[var(--text-secondary)]">
                          Explore available {category.name.toLowerCase()}{" "}
                          equipment.
                        </p>
                      </div>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-hairline)] text-[var(--text-secondary)] transition group-hover:border-[#7aa2f7] group-hover:bg-[#7aa2f7] group-hover:text-[#0a0e14]">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
