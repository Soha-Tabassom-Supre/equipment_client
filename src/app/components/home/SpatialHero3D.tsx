"use client";

import { useRef, useState } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Compass,
  Layers,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const DECK_ITEMS = [
  {
    id: "demo-101",
    tag: "PHOTOGRAPHY",
    title: "Professional Camera Kit",
    subtitle: "Cinema & Photography Equipment",
    rate: "৳4,200",
    unit: "/day",
    location: "Sample Location",
    status: "Sample Listing",
    telemetry: ["Camera Equipment", "Professional Grade", "Rental Available"],
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "demo-102",
    tag: "CONSTRUCTION",
    title: "Industrial Equipment",
    subtitle: "Construction & Engineering Tools",
    rate: "৳3,100",
    unit: "/day",
    location: "Sample Location",
    status: "Sample Listing",
    telemetry: ["Industrial Tools", "Heavy Equipment", "Rental Available"],
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "demo-103",
    tag: "AGRICULTURE",
    title: "Agricultural Equipment",
    subtitle: "Modern Farming Equipment",
    rate: "৳5,400",
    unit: "/day",
    location: "Sample Location",
    status: "Sample Listing",
    telemetry: ["Agriculture", "Modern Equipment", "Rental Available"],
    image:
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=900&q=80",
  },
];

const CATEGORIES = [
  "Photography",
  "Construction",
  "Electronics",
  "Agriculture",
];

export default function SpatialHero3D() {
  const [activeIndex, setActiveIndex] = useState(0);

  const stageRef = useRef<HTMLDivElement | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = {
    stiffness: 170,
    damping: 22,
  };

  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [11, -11]),
    springConfig,
  );

  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-13, 13]),
    springConfig,
  );

  const glareX = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [15, 85]),
    springConfig,
  );

  const glareY = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [15, 85]),
    springConfig,
  );

  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(125, 207, 255, 0.16), transparent 60%)`;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;

    const rect = stageRef.current.getBoundingClientRect();

    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const activeItem = DECK_ITEMS[activeIndex];

  return (
    <section className="relative overflow-hidden border-b border-[var(--border-hairline)] bg-architectural-grid">
    
      <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[#7aa2f7]/15 blur-[130px]" />

      <div className="pointer-events-none absolute bottom-0 right-1/5 h-96 w-96 rounded-full bg-[#9d7cd8]/15 blur-[130px]" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="space-y-6 lg:col-span-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#7aa2f7]/30 bg-[#7aa2f7]/10 px-3.5 py-1.5 text-xs font-medium text-[#7aa2f7]">
              <Sparkles className="h-3.5 w-3.5" />

              <span>Equipment Rental Marketplace</span>
            </div>

            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Access the equipment you need{" "}
              <span className="bg-gradient-to-r from-[#7aa2f7] via-[#7dcfff] to-[#9d7cd8] bg-clip-text text-transparent">
                without owning it.
              </span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
              Find and rent photography, construction, agricultural, and other
              equipment from owners. Get the tools you need for your next
              project without the cost of ownership.
            </p>

           
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/equipment"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7aa2f7] to-[#638df2] px-6 py-3.5 text-sm font-semibold text-[#0a0e14] shadow-lg shadow-[#7aa2f7]/25 transition hover:brightness-110"
              >
                <span>Explore Equipment</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-6 py-3.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[#7aa2f7]/60"
              >
                <span>Become an Owner</span>
              </Link>
            </div>

         
            <div className="pt-2">
              <p className="mb-2.5 text-xs font-medium uppercase tracking-widest text-[var(--text-secondary)]">
                Explore Categories
              </p>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <Link
                    key={category}
                    href={`/equipment?category=${encodeURIComponent(category)}`}
                    className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]/70 px-3 py-1.5 text-xs text-[var(--text-secondary)] transition hover:border-[#7aa2f7] hover:text-[var(--text-primary)]"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>

           
            <div className="grid grid-cols-3 gap-4 border-t border-[var(--border-hairline)] pt-6">
              <div>
                <div className="font-mono text-xl font-semibold">6</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Equipment Categories
                </div>
              </div>

              <div>
                <div className="font-mono text-xl font-semibold text-[var(--accent-cyan)]">
                  3
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  User Roles
                </div>
              </div>

              <div>
                <div className="font-mono text-xl font-semibold text-[#9d7cd8]">
                  Stripe
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Online Payments
                </div>
              </div>
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75 }}
            ref={stageRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: 1300 }}
            className="relative flex flex-col items-center justify-center py-6 lg:col-span-6"
          >
           
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 48,
                repeat: Infinity,
                ease: "linear",
              }}
              className="pointer-events-none absolute h-[410px] w-[410px] rounded-full border border-dashed border-[#7aa2f7]/25"
            />

            <motion.div
              animate={{ rotate: -360 }}
              transition={{
                duration: 36,
                repeat: Infinity,
                ease: "linear",
              }}
              className="pointer-events-none absolute h-[320px] w-[320px] rounded-full border border-[#9d7cd8]/20"
            />

           
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full max-w-md"
            >
             
              <div
                style={{
                  transform: "translateZ(-36px) translateY(18px) scale(0.94)",
                }}
                className="pointer-events-none absolute inset-0 rounded-3xl border border-[#7aa2f7]/25 bg-[#111722]/60"
              />

              
              <div className="relative overflow-hidden rounded-3xl border border-[#7aa2f7]/35 bg-[var(--bg-surface)]/95 p-5 shadow-2xl">
               
                <motion.div
                  style={{ background: glare }}
                  className="pointer-events-none absolute inset-0 z-10"
                />

                <div className="relative z-20 mb-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7aa2f7]/15 px-3 py-1 font-mono text-[11px] font-medium text-[#7aa2f7]">
                    <Layers className="h-3 w-3" />
                    {activeItem.tag}
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7dcfff]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#7dcfff]" />
                    {activeItem.status}
                  </span>
                </div>

               
                <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-[var(--border-hairline)]">
                  <img
                    src={activeItem.image}
                    alt={activeItem.title}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14]/90 via-transparent to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-slate-300">
                        {activeItem.location}
                      </p>

                      <h3 className="text-lg font-semibold text-white">
                        {activeItem.title}
                      </h3>
                    </div>

                    <div className="rounded-xl border border-white/15 bg-[#0a0e14]/80 px-3 py-1.5 text-right backdrop-blur-md">
                      <span className="font-mono text-lg font-bold text-[#7dcfff]">
                        {activeItem.rate}
                      </span>

                      <span className="text-xs text-slate-300">
                        {activeItem.unit}
                      </span>
                    </div>
                  </div>
                </div>

               
                <div className="relative z-20 mt-4 flex flex-wrap gap-2">
                  {activeItem.telemetry.map((spec) => (
                    <span
                      key={spec}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] px-2.5 py-1 font-mono text-[11px] text-[var(--text-secondary)]"
                    >
                      <CheckCircle2 className="h-3 w-3 text-[#7aa2f7]" />
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="relative z-20 mt-5 flex items-center justify-between border-t border-[var(--border-hairline)] pt-4">
                  <div className="text-xs text-[var(--text-secondary)]">
                    {activeItem.subtitle}
                  </div>

                  <Link
                    href="/equipment"
                    className="inline-flex items-center gap-1 rounded-lg bg-[#7aa2f7]/15 px-3 py-1.5 text-xs font-semibold text-[#7aa2f7] transition hover:bg-[#7aa2f7] hover:text-[#0a0e14]"
                  >
                    <span>Explore</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>


              <div
                style={{ transform: "translateZ(42px)" }}
                className="absolute -right-7 -top-5 hidden items-center gap-2.5 rounded-2xl border border-[#7dcfff]/30 bg-[#111722]/90 px-3.5 py-2.5 shadow-xl sm:flex"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7dcfff]/15 text-[#7dcfff]">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-white">
                    Secure Payments
                  </div>

                  <div className="font-mono text-[10px] text-[#7dcfff]">
                    Stripe Checkout
                  </div>
                </div>
              </div>

          
              <div
                style={{ transform: "translateZ(36px)" }}
                className="absolute -left-7 bottom-16 hidden items-center gap-2.5 rounded-2xl border border-[#9d7cd8]/30 bg-[#111722]/90 px-3.5 py-2.5 shadow-xl sm:flex"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#9d7cd8]/15 text-[#9d7cd8]">
                  <Zap className="h-4 w-4" />
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-white">
                    Flexible Rentals
                  </div>

                  <div className="font-mono text-[10px] text-[#9d7cd8]">
                    Equipment Marketplace
                  </div>
                </div>
              </div>
            </motion.div>

          
            <div className="relative z-20 mt-8 flex flex-wrap items-center justify-center gap-2.5">
              {DECK_ITEMS.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(index)}
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                    activeIndex === index
                      ? "border-[#7aa2f7] bg-[#7aa2f7]/15 text-[var(--text-primary)]"
                      : "border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[#7aa2f7]/40"
                  }`}
                >
                  <Compass className="h-3.5 w-3.5 text-[#7aa2f7]" />

                  <span>{item.title.split(" ").slice(0, 2).join(" ")}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
