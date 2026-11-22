"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  Filter,
  Package,
  Search,
  Shield,
} from "lucide-react";

const ITEMS_PER_PAGE = 6;

type Role = "customer" | "owner" | "admin";

type Booking = {
  _id: string;
  customerId: string;
  ownerId: string;
  equipmentId: string;
  equipmentName: string;
  startDate: string;
  endDate: string;
  rentalDays: number;
  pricePerDay: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  paymentStatus?: "paid" | "unpaid";
  createdAt: string;
};

type BookingStatus = "All" | Booking["status"];

export default function BookingsPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus>("All");
  const [currentPage, setCurrentPage] = useState(1);

  const role = session?.user.role as Role | undefined;

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login?redirect=/bookings");
    }
  }, [isPending, session, router]);

  
  useEffect(() => {
    if (isPending || !session || !role) return;

    let cancelled = false;

    async function loadBookings() {
      try {
        setLoading(true);
        setError("");

        const endpoint =
          role === "admin"
            ? "/api/admin/bookings"
            : role === "owner"
              ? "/api/bookings/owner-requests"
              : "/api/bookings/my-bookings";

        const result = await apiFetch(endpoint);

        if (!cancelled) {
          setBookings(result.bookings || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load bookings.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBookings();

    return () => {
      cancelled = true;
    };
  }, [isPending, session, role]);

 
  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !query ||
        booking.equipmentName.toLowerCase().includes(query) ||
        booking.customerId.toLowerCase().includes(query) ||
        booking.ownerId.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / ITEMS_PER_PAGE),
  );

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const totalVolume = bookings.reduce(
    (sum, booking) => sum + booking.totalAmount,
    0,
  );

  const paidVolume = bookings
    .filter((booking) => booking.paymentStatus === "paid")
    .reduce((sum, booking) => sum + booking.totalAmount, 0);

  const confirmedCount = bookings.filter(
    (booking) => booking.status === "confirmed",
  ).length;

  const cancelledCount = bookings.filter(
    (booking) =>
      booking.status === "cancelled" || booking.status === "rejected",
  ).length;

 
  const handlePayment = async (bookingId: string) => {
    try {
      setPayingId(bookingId);
      setError("");

      const result = await apiFetch("/api/payments/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ bookingId }),
      });

      if (!result.checkoutUrl) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.href = result.checkoutUrl;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to start Stripe checkout.",
      );
      setPayingId(null);
    }
  };

  if (isPending || !session || !role || loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center font-mono text-xs text-[var(--text-secondary)]">
        {isPending || !session
          ? "Verifying JWT Session..."
          : "Loading Booking Records..."}
      </div>
    );
  }

  if (!["customer", "owner", "admin"].includes(role)) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center text-sm text-[var(--text-secondary)]">
        Unauthorized access.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-3 py-1 font-mono text-[11px] font-medium text-[var(--accent-primary)]">
            <Shield className="h-3 w-3" />
            <span>{role} Ledger View</span>
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {role === "admin"
              ? "All Platform Bookings"
              : role === "owner"
                ? "Fleet Rental Bookings"
                : "My Rental Bookings"}
          </h1>
        </div>

        {role === "customer" && (
          <Link
            href="/equipment"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#638df2] px-4 py-2.5 text-xs font-semibold text-[#0a0e14] transition hover:brightness-110"
          >
            <span>Reserve More Equipment</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-400">
          {error}
        </div>
      )}

     
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl specular-card p-5">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Total Bookings</span>
            <Calendar className="h-4 w-4 text-[var(--accent-primary)]" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold">
            {bookings.length}
          </div>
        </div>

        <div className="rounded-2xl specular-card p-5">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Confirmed / Rejected or Cancelled</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-400">
            {confirmedCount}
            <span className="text-sm font-normal text-[var(--text-secondary)]">
              {" "}
              / {cancelledCount}
            </span>
          </div>
        </div>

        <div className="rounded-2xl specular-card p-5">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>
              {role === "customer"
                ? "Total Rental Value"
                : "Settled Stripe Volume"}
            </span>
            <CreditCard className="h-4 w-4 text-[var(--accent-cyan)]" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-[var(--accent-cyan)]">
            ৳{(role === "customer" ? totalVolume : paidVolume).toLocaleString()}
          </div>
        </div>
      </div>

    
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl specular-card p-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search equipment or user ID..."
            className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] py-2 pl-10 pr-4 text-xs outline-none focus:border-[var(--accent-primary)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="mr-1 inline-flex items-center gap-1 text-[var(--text-secondary)]">
            <Filter className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
            Status:
          </span>

          {(
            ["All", "pending", "confirmed", "rejected", "cancelled"] as const
          ).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-2.5 py-1 font-medium capitalize transition ${
                statusFilter === status
                  ? "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

    
      <div className="overflow-x-auto rounded-2xl specular-card">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)]">
            <tr>
              <th className="p-4">Equipment</th>
              {role !== "customer" && <th className="p-4">Customer ID</th>}
              {role !== "owner" && <th className="p-4">Owner ID</th>}
              <th className="p-4">Rental Period</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Booking Status</th>
              {role === "customer" && <th className="p-4">Action</th>}
              <th className="p-4 text-right">Asset</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border-hairline)]">
            {paginatedBookings.length === 0 ? (
              <tr>
                <td
                  colSpan={role === "admin" ? 8 : role === "customer" ? 7 : 7}
                  className="p-12 text-center text-[var(--text-secondary)]"
                >
                  <Package className="mx-auto mb-2 h-6 w-6 opacity-50" />
                  No rental booking records match your current filter.
                </td>
              </tr>
            ) : (
              paginatedBookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="transition hover:bg-[var(--bg-elevated)]/40"
                >
                  <td className="p-4">
                    <div className="font-semibold">{booking.equipmentName}</div>
                    <div className="font-mono text-[11px] text-[var(--text-secondary)]">
                      Booked: {new Date(booking.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {role !== "customer" && (
                    <td className="p-4 font-mono text-[10px] text-[var(--text-secondary)]">
                      {booking.customerId}
                    </td>
                  )}

                  {role !== "owner" && (
                    <td className="p-4 font-mono text-[10px] text-[var(--text-secondary)]">
                      {booking.ownerId}
                    </td>
                  )}

                  <td className="p-4 font-mono whitespace-nowrap">
                    {new Date(booking.startDate).toLocaleDateString()}
                    {" → "}
                    {new Date(booking.endDate).toLocaleDateString()}
                  </td>

                  <td className="p-4">
                    <div className="font-mono font-bold text-[var(--accent-cyan)]">
                      ৳{booking.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)]">
                      {booking.rentalDays} days
                    </div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] ${
                        booking.paymentStatus === "paid"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      {booking.paymentStatus || "unpaid"}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${
                        booking.status === "confirmed"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : booking.status === "rejected" ||
                              booking.status === "cancelled"
                            ? "bg-rose-500/15 text-rose-400"
                            : "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>

                  {role === "customer" && (
                    <td className="p-4">
                      {booking.status === "confirmed" &&
                      booking.paymentStatus !== "paid" ? (
                        <button
                          type="button"
                          disabled={payingId === booking._id}
                          onClick={() => handlePayment(booking._id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[var(--accent-primary)] to-[#638df2] px-3 py-2 text-[11px] font-semibold text-[#0a0e14] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          {payingId === booking._id
                            ? "Redirecting..."
                            : "Pay Now"}
                        </button>
                      ) : booking.paymentStatus === "paid" ? (
                        <span className="text-[11px] text-emerald-400">
                          Paid
                        </span>
                      ) : (
                        <span className="text-[11px] text-[var(--text-secondary)]">
                          Awaiting confirmation
                        </span>
                      )}
                    </td>
                  )}

                  <td className="p-4 text-right">
                    <Link
                      href={`/equipment/${booking.equipmentId}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-hairline)] px-2.5 py-1 font-medium text-[var(--accent-primary)] transition hover:border-[var(--accent-primary)]"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

     
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentPage(idx + 1)}
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
