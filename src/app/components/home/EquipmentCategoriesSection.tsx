"use client";

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
} from "lucide-react";

const categories = [
  {
    name: "Construction",
    description: "Tools and machinery for every building project.",
    icon: Construction,
    count: "01",
    accent: "#7aa2f7",
  },
  {
    name: "Photography",
    description: "Cameras, lenses, and professional studio equipment.",
    icon: Camera,
    count: "02",
    accent: "#9d7cd8",
  },
  {
    name: "Vehicles",
    description: "Reliable vehicles for your work and transportation.",
    icon: CarFront,
    count: "03",
    accent: "#7dcfff",
  },
  {
    name: "Agriculture",
    description: "Modern equipment for smarter farming.",
    icon: Sprout,
    count: "04",
    accent: "#9ece6a",
  },
  {
    name: "Electronics",
    description: "Essential electronics and technical equipment.",
    icon: Cpu,
    count: "05",
    accent: "#e0af68",
  },
  {
    name: "Event",
    description: "Equipment to bring your events to life.",
    icon: PartyPopper,
    count: "06",
    accent: "#f7768e",
  },
];

export default function EquipmentCategoriesSection() {
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

    
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.09,
              },
            },
          }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((category) => {
            const Icon = category.icon;

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
                    style={{ backgroundColor: category.accent }}
                  />

                
                  <div className="relative flex items-start justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl border"
                      style={{
                        color: category.accent,
                        borderColor: `${category.accent}35`,
                        backgroundColor: `${category.accent}12`,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="font-mono text-xs text-[var(--text-secondary)]">
                      {category.count}
                    </span>
                  </div>

                  <div className="relative mt-8 flex items-end justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] transition group-hover:text-[#7aa2f7]">
                        {category.name}
                      </h3>

                      <p className="mt-2 max-w-xs text-xs leading-6 text-[var(--text-secondary)]">
                        {category.description}
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
      </div>
    </section>
  );
}
