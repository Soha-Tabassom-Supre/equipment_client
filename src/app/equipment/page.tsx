"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  RotateCcw,
  Search,
  SlidersHorizontal,
  MapPin,
  Package,
  ArrowUpRight,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ITEMS_PER_PAGE = 6;

type SortOption = "recent" | "price-asc" | "price-desc";

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

function AllEquipmentContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category") || "All";

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState(urlCategory);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [currentPage, setCurrentPage] = useState(1);

 
  useEffect(() => {
    const controller = new AbortController();

    async function fetchEquipment() {
      try {
        if (!API_URL) {
          throw new Error("API URL is missing. Check your .env.local file.");
        }

        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/equipment?limit=100&page=1`,
          { signal: controller.signal },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load equipment.");
        }

        setEquipment(result.equipment || []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading equipment.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchEquipment();

    return () => controller.abort();
  }, []);

  
  const categories = useMemo(() => {
    return Array.from(
      new Set(equipment.map((item) => item.category).filter(Boolean)),
    ).sort();
  }, [equipment]);

  
  const filteredEquipment = useMemo(() => {
    return equipment
      .filter((item) => {
        const q = searchQuery.trim().toLowerCase();

        const matchesSearch =
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q);

        const matchesCategory =
          category === "All" || item.category === category;

        const matchesPrice = item.pricePerDay <= maxPrice;

        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") {
          return a.pricePerDay - b.pricePerDay;
        }

        if (sortBy === "price-desc") {
          return b.pricePerDay - a.pricePerDay;
        }

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [equipment, searchQuery, category, maxPrice, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEquipment.length / ITEMS_PER_PAGE),
  );

  const paginatedItems = filteredEquipment.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const resetFilters = () => {
    setSearchQuery("");
    setCategory("All");
    setMaxPrice(1500);
    setSortBy("recent");
    setCurrentPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent-primary)]">
            Approved Fleet Directory
          </span>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            All Equipment
          </h1>
        </div>

        <div className="font-mono text-xs text-[var(--text-secondary)]">
          Showing {paginatedItems.length} of {filteredEquipment.length} approved
          assets
        </div>
      </div>

    
      <div className="mb-8 space-y-4 rounded-2xl specular-card p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        
          <div className="relative md:col-span-5">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-secondary)]" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by equipment name or location..."
              className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-[var(--accent-primary)]"
            />
          </div>

         
          <div className="md:col-span-3">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2.5 text-xs outline-none focus:border-[var(--accent-primary)]"
            >
              <option value="All">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

      
          <div className="md:col-span-4">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortOption);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2.5 text-xs outline-none focus:border-[var(--accent-primary)]"
            >
              <option value="recent">Recently Added</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

      
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-hairline)] pt-4 text-xs">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
            <span>Filter by daily price</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span className="text-[var(--text-secondary)]">
                Max Price:{" "}
                <strong className="font-mono text-[var(--accent-cyan)]">
                  ${maxPrice}
                </strong>
              </span>

              <input
                type="range"
                min="50"
                max="1500"
                step="25"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="accent-[var(--accent-primary)]"
              />
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-hairline)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      
      {loading && (
        <div className="rounded-2xl specular-card p-14 text-center">
          <p className="font-mono text-xs text-[var(--text-secondary)]">
            Loading Fleet Directory...
          </p>
        </div>
      )}

    
      {!loading && error && (
        <div className="rounded-2xl specular-card p-14 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}


      {!loading && !error && paginatedItems.length === 0 && (
        <div className="rounded-2xl specular-card p-14 text-center">
          <Package className="mx-auto mb-3 h-8 w-8 text-[var(--text-secondary)]" />

          <p className="text-sm text-[var(--text-secondary)]">
            No approved equipment matches your active search or filter criteria.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 rounded-xl bg-[var(--accent-primary)] px-4 py-2 text-xs font-semibold text-[#0a0e14]"
          >
            Clear All Filters
          </button>
        </div>
      )}

    
      {!loading && !error && paginatedItems.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedItems.map((item) => (
            <Link
              key={item._id}
              href={`/equipment/${item._id}`}
              className="group overflow-hidden rounded-2xl specular-card transition hover:-translate-y-1"
            >
           
              <div className="relative h-52 overflow-hidden bg-[var(--bg-elevated)]">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-12 w-12 text-[var(--text-secondary)]" />
                  </div>
                )}

                <span className="absolute left-3 top-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)]/90 px-2.5 py-1 font-mono text-[10px] uppercase text-[var(--accent-primary)]">
                  {item.category}
                </span>

                <ArrowUpRight className="absolute right-3 top-3 h-5 w-5 text-white opacity-0 transition group-hover:opacity-100" />
              </div>

              <div className="space-y-3 p-5">
                <div>
                  <h2 className="text-base font-semibold transition group-hover:text-[var(--accent-primary)]">
                    {item.name}
                  </h2>

                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border-hairline)] pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.location}
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-[var(--accent-cyan)]">
                      ${item.pricePerDay}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)]">
                      per day
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
                  <span>Condition: {item.condition}</span>
                  <span className="text-[var(--accent-primary)]">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentPage(idx + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`h-9 w-9 rounded-xl font-mono text-xs font-semibold transition ${
                currentPage === idx + 1
                  ? "bg-[var(--accent-primary)] text-[#0a0e14]"
                  : "border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AllEquipmentPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center font-mono text-xs text-[var(--text-secondary)]">
          Loading Fleet Directory...
        </div>
      }
    >
      <AllEquipmentContent />
    </Suspense>
  );
}
