"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import EquipmentCard, { type Equipment } from "./EquipmentCard";

interface EquipmentResponse {
  equipment: Equipment[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function FeaturedEquipmentSection() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchFeaturedEquipment() {
      try {
        const response = await fetch(
          `${API_URL}/api/equipment?limit=6&page=1`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Failed to load featured equipment.");
        }

        const data: EquipmentResponse = await response.json();

        setEquipment(data.equipment.slice(0, 6));
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchFeaturedEquipment();

    return () => controller.abort();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
    
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#7aa2f7]">
            Curated Inventory
          </span>

          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            Featured Equipment
          </h2>
        </div>

        <Link
          href="/equipment"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#7aa2f7] transition hover:underline"
        >
          <span>Browse All Equipment</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

     
      {loading && (
        <p className="py-12 text-center text-sm text-[var(--text-secondary)]">
          Loading equipment...
        </p>
      )}

     
      {!loading && error && (
        <p className="py-12 text-center text-sm text-rose-400">{error}</p>
      )}

     
      {!loading && !error && equipment.length === 0 && (
        <p className="py-12 text-center text-sm text-[var(--text-secondary)]">
          No approved equipment available yet.
        </p>
      )}

   
      {!loading && !error && equipment.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {equipment.map((item) => (
            <EquipmentCard key={item._id} item={item} />
          ))}
        </motion.div>
      )}
    </section>
  );
}
