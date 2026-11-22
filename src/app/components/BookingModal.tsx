"use client";

import React, { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Equipment {
  _id: string;
  name: string;
  rentalType: "daily" | "weekly" | "monthly";
  rentalPrice: number;
  availableQuantity: number;
}

interface BookingModalProps {
  item: Equipment;
  onClose: () => void;
}

export default function BookingModal({ item, onClose }: BookingModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [contactNumber, setContactNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const rentalDays =
    startDate && endDate
      ? Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  let rentalPeriods = 0;

  if (rentalDays > 0) {
    if (item.rentalType === "daily") {
      rentalPeriods = rentalDays;
    } else if (item.rentalType === "weekly") {
      rentalPeriods = Math.ceil(rentalDays / 7);
    } else {
      rentalPeriods = Math.ceil(rentalDays / 30);
    }
  }

  const totalAmount = rentalPeriods * item.rentalPrice * quantity;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!startDate || !endDate || rentalDays <= 0) {
      setError("Please select valid rental dates.");
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > item.availableQuantity
    ) {
      setError(`Select a quantity between 1 and ${item.availableQuantity}.`);
      return;
    }

    if (!contactNumber.trim()) {
      setError("Contact number is required.");
      return;
    }

    if (!deliveryAddress.trim()) {
      setError("Delivery address is required.");
      return;
    }

    try {
      setLoading(true);

      await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          equipmentId: item._id,
          startDate,
          endDate,
          quantity,
          contactNumber,
          deliveryAddress,
          additionalNotes,
        }),
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit booking request.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl specular-card p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />

          <h3 className="mt-4 text-xl font-bold">Booking Request Submitted</h3>

          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            Your request for {item.name} has been submitted. The equipment owner
            must confirm your booking before you can proceed to payment.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-[var(--accent-primary)] py-3 text-xs font-semibold text-[#0a0e14]"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl specular-card p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent-primary)]">
              Reservation Request
            </span>
            <h3 className="text-lg font-bold">{item.name}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-xl border border-[var(--border-hairline)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="mt-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-medium">
                Rental Start Date
              </label>

              <input
                type="date"
                required
                min={new Date().toLocaleDateString("en-CA")}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium">Rental End Date</label>

              <input
                type="date"
                required
                min={startDate || new Date().toLocaleDateString("en-CA")}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 outline-none focus:border-[var(--accent-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-medium">Booking Quantity</label>

            <input
              type="number"
              min={1}
              max={item.availableQuantity}
              step={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 outline-none focus:border-[var(--accent-primary)]"
            />

            <p className="mt-1 text-[10px] text-[var(--text-secondary)]">
              {item.availableQuantity} unit(s) currently listed as available
            </p>
          </div>

          <div>
            <label className="mb-1 block font-medium">Contact Number</label>

            <input
              type="tel"
              required
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 outline-none focus:border-[var(--accent-primary)]"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Delivery Address</label>

            <textarea
              required
              rows={2}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter your complete delivery address"
              className="w-full resize-none rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 outline-none focus:border-[var(--accent-primary)]"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Additional Notes (Optional)
            </label>

            <textarea
              rows={2}
              maxLength={1000}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any additional instructions..."
              className="w-full resize-none rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 outline-none focus:border-[var(--accent-primary)]"
            />
          </div>

          <div className="rounded-2xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Estimated rental cost
                </p>

                <p className="mt-1 font-semibold">
                  ৳{item.rentalPrice.toLocaleString("en-BD")} /{" "}
                  {item.rentalType}
                </p>

                <p className="mt-1 text-[10px] text-[var(--text-secondary)]">
                  {rentalDays > 0
                    ? `${rentalDays} days · ${rentalPeriods} rental period(s) · ${quantity} unit(s)`
                    : "Select rental dates to calculate the cost"}
                </p>
              </div>

              <div className="whitespace-nowrap font-mono text-xl font-bold text-[var(--accent-cyan)]">
                ৳{totalAmount.toLocaleString("en-BD")}
              </div>
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
            Payment will become available after the equipment owner accepts your
            booking request.
          </p>

          {error && (
            <p className="rounded-lg bg-rose-500/10 p-3 text-xs text-rose-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || rentalDays <= 0}
            className="w-full rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#638df2] py-3 text-xs font-semibold text-[#0a0e14] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting Request..." : "Submit Booking Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
