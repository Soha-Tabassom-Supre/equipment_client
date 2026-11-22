"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { Check, PlusCircle, Shield, Trash2, Upload, X } from "lucide-react";
import TelemetryChart from "../components/TelemetryChart";
import { useToast } from "../components/home/ToastProvider";
type Equipment = {
  _id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  condition: string;
  images?: string[];
  ownerId: string;
  status: string;
  rentalType: "daily" | "weekly" | "monthly";
  rentalPrice: number;
  availableQuantity: number;
  brand: string;
  model: string;
  rentalTerms: string;
};

type Booking = {
  _id: string;
  customerId: string;
  ownerId: string;
  equipmentId: string;
  equipmentName: string;
  startDate: string;
  endDate: string;
  rentalDays: number;
  totalAmount: number;
  status: string;
  createdAt: string;
};

type User = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  isBlocked?: boolean;
};

const CATEGORIES = [
  "Electronics",
  "Camera",
  "Vehicles",
  "Tools",
  "Furniture",
  "Sports",
  "Other",
];

const getId = (item: { _id?: string; id?: string }) =>
  String(item._id || item.id || "");

const formatDate = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
};

const formatStatus = (status?: string) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "—";

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  const currentUser = session?.user;
  const roleValue = (
    currentUser as typeof currentUser & {
      role?: string;
    }
  )?.role;

  const role =
    roleValue === "admin"
      ? "Admin"
      : roleValue === "owner"
        ? "Owner"
        : "Customer";

  const getDefaultTab = (r: string) =>
    r === "Customer" ? "rentals" : "analytics";

  const [tab, setTab] = useState(getDefaultTab(role));

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Equipment[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || "",
    photo: currentUser?.image || "",
  });

  const [newEq, setNewEq] = useState({
    name: "",
    description: "",
    category: CATEGORIES[0],
    location: "",
    condition: "Good",
    image: "",
    rentalType: "daily" as "daily" | "weekly" | "monthly",
    rentalPrice: 150,
    availableQuantity: 1,
    brand: "",
    model: "",
    rentalTerms: "",
  });

  useEffect(() => {
    setTab(getDefaultTab(role));
  }, [role]);

  useEffect(() => {
    setProfileForm({
      name: currentUser?.name || "",
      photo: currentUser?.image || "",
    });
  }, [currentUser?.name, currentUser?.image]);

  const loadDashboard = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    setError("");

    try {
      if (role === "Customer") {
        const [bookingData, favoriteData] = await Promise.all([
          apiFetch("/api/bookings/my-bookings"),
          apiFetch("/api/favorites"),
        ]);

        setBookings(bookingData.bookings || []);
        setFavorites(favoriteData.equipment || []);
      }

      if (role === "Owner") {
        const [equipmentData, bookingData, analyticsData] = await Promise.all([
          apiFetch("/api/equipment/my-equipment"),
          apiFetch("/api/bookings/owner-requests"),
          apiFetch("/api/owner/analytics"),
        ]);

        setEquipment(equipmentData.equipment || []);
        setBookings(bookingData.bookings || []);
        setAnalytics(analyticsData.analytics || null);
      }

      if (role === "Admin") {
        const [
          userData,
          bookingData,
          pendingData,
          approvedData,
          analyticsData,
        ] = await Promise.all([
          apiFetch("/api/admin/users"),
          apiFetch("/api/admin/bookings"),
          apiFetch("/api/admin/pending-equipment"),
          apiFetch("/api/equipment?limit=100&page=1"),
          apiFetch("/api/admin/analytics"),
        ]);

        setUsers(userData.users || []);
        setBookings(bookingData.bookings || []);

        const approved = approvedData.equipment || [];
        const pending = pendingData.equipment || [];

        const combined = [
          ...approved,
          ...pending.filter(
            (p: Equipment) =>
              !approved.some((a: Equipment) => getId(a) === getId(p)),
          ),
        ];

        setEquipment(combined);
        setAnalytics(analyticsData.analytics || null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser, role]);

  useEffect(() => {
    if (!isPending && currentUser) {
      loadDashboard();
    }
  }, [isPending, currentUser, loadDashboard]);

  const handleImgbbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

      if (apiKey && apiKey !== "your_imgbb_api_key_here") {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(
          `https://api.imgbb.com/1/upload?key=${apiKey}`,
          {
            method: "POST",
            body: formData,
          },
        );

        const data = await response.json();

        if (data?.success) {
          setNewEq((prev) => ({
            ...prev,
            image: data.data.display_url,
          }));
          showToast("Equipment photo uploaded.");
          return;
        }
      }

      showToast("Image upload failed. Check your imgbb API key.");
    } catch {
      showToast("Image upload failed.");
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !Number.isFinite(newEq.rentalPrice) ||
      newEq.rentalPrice <= 0 ||
      !Number.isInteger(newEq.availableQuantity) ||
      newEq.availableQuantity < 1
    ) {
      showToast("Enter a valid rental price and available quantity.");
      return;
    }

    setActionLoading(true);

    try {
      await apiFetch("/api/equipment", {
        method: "POST",
        body: JSON.stringify({
          name: newEq.name,
          description: newEq.description,
          category: newEq.category,
          location: newEq.location,
          condition: newEq.condition,
          rentalType: newEq.rentalType,
          rentalPrice: Number(newEq.rentalPrice),
          availableQuantity: Number(newEq.availableQuantity),
          brand: newEq.brand,
          model: newEq.model,
          rentalTerms: newEq.rentalTerms,
          images: newEq.image ? [newEq.image] : [],
        }),
      });

      showToast("Equipment submitted for approval.");

      setNewEq({
        name: "",
        description: "",
        category: CATEGORIES[0],
        location: "",
        condition: "Good",
        image: "",
        rentalType: "daily",
        rentalPrice: 150,
        availableQuantity: 1,
        brand: "",
        model: "",
        rentalTerms: "",
      });

      await loadDashboard();
      setTab("my-equipment");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not add equipment.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const removeFavorite = async (equipmentId: string) => {
    try {
      await apiFetch(`/api/favorites/${equipmentId}`, {
        method: "DELETE",
      });

      setFavorites((prev) =>
        prev.filter((item) => getId(item) !== equipmentId),
      );

      showToast("Favorite removed.");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not remove favorite.",
      );
    }
  };

  const deleteEquipment = async (equipmentId: string) => {
    if (!window.confirm("Are you sure you want to delete this equipment?")) {
      return;
    }

    try {
      await apiFetch(`/api/equipment/${equipmentId}`, {
        method: "DELETE",
      });

      setEquipment((prev) =>
        prev.filter((item) => getId(item) !== equipmentId),
      );

      showToast("Equipment deleted.");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not delete equipment.",
      );
    }
  };

  const updateBookingStatus = async (
    bookingId: string,
    action: "accept" | "reject" | "cancel",
  ) => {
    try {
      await apiFetch(`/api/bookings/${bookingId}/${action}`, {
        method: "PATCH",
      });

      showToast(`Booking ${action}ed successfully.`);
      await loadDashboard();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update booking.",
      );
    }
  };

  const cancelAdminBooking = async (bookingId: string) => {
    if (!window.confirm("Cancel this booking?")) return;

    try {
      await apiFetch(`/api/admin/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });

      showToast("Booking cancelled.");
      await loadDashboard();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not cancel booking.",
      );
    }
  };

  const approveEquipment = async (equipmentId: string) => {
    try {
      await apiFetch(`/api/admin/equipment/${equipmentId}/approve`, {
        method: "PATCH",
      });

      showToast("Equipment approved.");
      await loadDashboard();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not approve equipment.",
      );
    }
  };

  const rejectEquipment = async (equipmentId: string) => {
    const reason = window.prompt(
      "Enter a reason for rejecting this equipment:",
    );

    if (!reason?.trim()) return;

    try {
      await apiFetch(`/api/admin/equipment/${equipmentId}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });

      showToast("Equipment rejected.");
      await loadDashboard();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not reject equipment.",
      );
    }
  };

  const changeUserRole = async (
    userId: string,
    newRole: "customer" | "owner",
  ) => {
    try {
      await apiFetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });

      showToast("User role updated.");
      await loadDashboard();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update user role.",
      );
      await loadDashboard();
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await authClient.updateUser({
        name: profileForm.name,
        image: profileForm.photo || null,
      });

      showToast("Profile updated.");
    } catch {
      showToast("Could not update profile.");
    }
  };

  const tabsByRole: Record<string, { id: string; label: string }[]> = {
    Customer: [
      { id: "rentals", label: "My Rentals" },
      { id: "favorites", label: "Favorites" },
      { id: "profile", label: "Profile" },
    ],
    Owner: [
      { id: "analytics", label: "Owner Analytics" },
      { id: "add-equipment", label: "Add Equipment" },
      { id: "my-equipment", label: "My Equipment" },
      { id: "owner-rentals", label: "My Equipment Rental" },
      { id: "profile", label: "My Profile" },
    ],
    Admin: [
      { id: "analytics", label: "Platform Analytics" },
      { id: "all-users", label: "All Users" },
      { id: "all-equipment", label: "All Equipment" },
      { id: "all-rentals", label: "All Rentals" },
      { id: "profile", label: "My Profile" },
    ],
  };

  const myCustomerRentals = bookings;
  const myFavoriteItems = favorites;
  const myOwnerEquipment = equipment;
  const myOwnerRentals = bookings;

  const customerMap = new Map(users.map((u) => [String(u._id), u]));

  const getUserName = (id: string) =>
    customerMap.get(String(id))?.name || id || "Unknown user";

  if (isPending || !session) {
    return null;
  }

  const monthlySeries = (() => {
    const now = new Date();

    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);

      return {
        label: date.toLocaleString("en-US", { month: "short" }),
        year: date.getFullYear(),
        month: date.getMonth(),
        value: 0,
      };
    });

    bookings.forEach((booking) => {
      const date = new Date(booking.createdAt);

      const month = months.find(
        (item) =>
          item.year === date.getFullYear() && item.month === date.getMonth(),
      );

      if (month) {
        month.value += Number(booking.totalAmount || 0);
      }
    });

    return months.map(({ label, value }) => ({
      label,
      value,
    }));
  })();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl specular-card p-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.image || "https://ui-avatars.com/api/?name=User"}
            alt={currentUser?.name || "User"}
            className="h-14 w-14 rounded-2xl border border-[var(--accent-primary)]/40 object-cover"
          />

          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-primary)]/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--accent-primary)]">
              <Shield className="h-3 w-3" />
              <span>{role} Workspace</span>
            </div>

            <h1 className="mt-1 text-xl font-bold">{currentUser?.name}</h1>

            <p className="text-xs text-[var(--text-secondary)]">
              {currentUser?.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabsByRole[role]?.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                tab === t.id
                  ? "bg-[var(--accent-primary)] text-[#0a0e14]"
                  : "border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl specular-card p-8 text-center text-xs text-[var(--text-secondary)]">
          Loading dashboard data...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-xs text-rose-400">
          {error}
          <button
            type="button"
            onClick={loadDashboard}
            className="ml-3 underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {tab === "analytics" && (role === "Owner" || role === "Admin") && (
            <div className="space-y-6">
              {role === "Admin" ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    {
                      label: "Total Users",
                      val: analytics?.totalUsers ?? 0,
                    },
                    {
                      label: "Total Equipment",
                      val: analytics?.totalEquipment ?? 0,
                    },
                    {
                      label: "Total Bookings",
                      val: analytics?.totalBookings ?? 0,
                    },
                    {
                      label: "Pending Approvals",
                      val: analytics?.pendingEquipment ?? 0,
                    },
                    {
                      label: "Confirmed Rentals",
                      val: analytics?.confirmedBookings ?? 0,
                    },
                    {
                      label: "Total Revenue",
                      val: `৳${Number(
                        analytics?.totalRevenue || 0,
                      ).toLocaleString()}`,
                    },
                  ].map((kpi) => (
                    <div
                      key={kpi.label}
                      className="rounded-2xl specular-card p-4"
                    >
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        {kpi.label}
                      </div>
                      <div className="mt-1 font-mono text-xl font-bold text-[var(--accent-cyan)]">
                        {kpi.val}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    {
                      label: "Total Listed Equipment",
                      val: analytics?.totalEquipment ?? 0,
                    },
                    {
                      label: "Pending Requests",
                      val: analytics?.pendingRequests ?? 0,
                    },
                    {
                      label: "Total Earnings",
                      val: `৳${Number(
                        analytics?.totalEarnings || 0,
                      ).toLocaleString()}`,
                    },
                  ].map((kpi) => (
                    <div
                      key={kpi.label}
                      className="rounded-2xl specular-card p-5"
                    >
                      <div className="text-xs text-[var(--text-secondary)]">
                        {kpi.label}
                      </div>
                      <div className="mt-1 font-mono text-2xl font-bold text-[var(--accent-cyan)]">
                        {kpi.val}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <TelemetryChart
                title={
                  role === "Admin"
                    ? "Monthly Platform Booking Statistics"
                    : "Monthly Owner Booking Statistics"
                }
                subtitle="Hover over data nodes to inspect monthly booking value"
                data={monthlySeries}
              />

              <div className="rounded-2xl specular-card p-6">
                <h2 className="text-lg font-bold">
                  {role === "Admin"
                    ? "Platform Booking Statistics"
                    : "Owner Rental Statistics"}
                </h2>
                <p className="mt-2 text-xs text-[var(--text-secondary)]">
                  Live statistics from your platform database.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {(role === "Admin"
                    ? [
                        ["Customers", analytics?.totalCustomers ?? 0],
                        ["Owners", analytics?.totalOwners ?? 0],
                        ["Pending Bookings", analytics?.pendingBookings ?? 0],
                        [
                          "Confirmed Bookings",
                          analytics?.confirmedBookings ?? 0,
                        ],
                        [
                          "Cancelled Bookings",
                          analytics?.cancelledBookings ?? 0,
                        ],
                        ["Blocked Users", analytics?.totalBlockedUsers ?? 0],
                      ]
                    : [
                        [
                          "Approved Equipment",
                          analytics?.approvedEquipment ?? 0,
                        ],
                        ["Pending Equipment", analytics?.pendingEquipment ?? 0],
                        ["Total Bookings", analytics?.totalBookings ?? 0],
                        [
                          "Confirmed Bookings",
                          analytics?.confirmedBookings ?? 0,
                        ],
                      ]
                  ).map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4"
                    >
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        {label}
                      </p>
                      <p className="mt-1 font-mono text-xl font-bold text-[var(--accent-cyan)]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "rentals" && role === "Customer" && (
            <div className="overflow-x-auto rounded-2xl specular-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)]">
                  <tr>
                    <th className="p-4">Equipment Name</th>
                    <th className="p-4">Rental Start Date</th>
                    <th className="p-4">Rental End Date</th>
                    <th className="p-4">Booking Date</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Booking Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {myCustomerRentals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-8 text-center text-[var(--text-secondary)]"
                      >
                        No rentals found yet. Browse All Equipment to book your
                        first item.
                      </td>
                    </tr>
                  ) : (
                    myCustomerRentals.map((b) => (
                      <tr key={getId(b)}>
                        <td className="p-4 font-semibold">{b.equipmentName}</td>
                        <td className="p-4 font-mono">
                          {formatDate(b.startDate)}
                        </td>
                        <td className="p-4 font-mono">
                          {formatDate(b.endDate)}
                        </td>
                        <td className="p-4 font-mono">
                          {formatDate(b.createdAt)}
                        </td>
                        <td className="p-4 font-mono font-bold text-[var(--accent-cyan)]">
                          ৳{b.totalAmount}
                        </td>
                        <td className="p-4">{formatStatus(b.status)}</td>
                        <td className="p-4">
                          {b.status === "pending" && (
                            <button
                              type="button"
                              onClick={() =>
                                updateBookingStatus(getId(b), "cancel")
                              }
                              className="rounded-lg border border-rose-500/40 px-3 py-1.5 text-rose-400"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "favorites" && role === "Customer" && (
            <div className="overflow-x-auto rounded-2xl specular-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)]">
                  <tr>
                    <th className="p-4">Equipment</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Rate</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {myFavoriteItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-[var(--text-secondary)]"
                      >
                        Your favorites list is empty.
                      </td>
                    </tr>
                  ) : (
                    myFavoriteItems.map((item) => (
                      <tr key={getId(item)}>
                        <td className="p-4 font-semibold">{item.name}</td>
                        <td className="p-4">{item.category}</td>
                        <td className="p-4 font-mono text-[var(--accent-cyan)]">
                          ৳{item.rentalPrice} / {item.rentalType}
                        </td>
                        <td className="p-4 flex gap-2">
                          <Link
                            href={`/equipment/${getId(item)}`}
                            className="rounded-lg bg-[var(--accent-primary)]/15 px-3 py-1.5 font-semibold text-[var(--accent-primary)]"
                          >
                            View Details
                          </Link>

                          <button
                            type="button"
                            onClick={() => removeFavorite(getId(item))}
                            className="rounded-lg border border-[var(--border-hairline)] px-3 py-1.5 text-rose-400"
                          >
                            Remove Favorite
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "add-equipment" && role === "Owner" && (
            <form
              onSubmit={handleAddEquipment}
              className="space-y-4 rounded-3xl specular-card p-6 text-xs sm:p-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Add New Equipment</h2>

                <span className="rounded-full bg-amber-500/15 px-3 py-1 font-mono text-[11px] text-amber-300">
                  Default Status: Pending
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-medium">
                    Equipment Name
                  </label>
                  <input
                    required
                    value={newEq.name}
                    onChange={(e) =>
                      setNewEq({ ...newEq, name: e.target.value })
                    }
                    placeholder="ARRI Alexa Mini LF"
                    className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium">Category</label>
                  <select
                    value={newEq.category}
                    onChange={(e) =>
                      setNewEq({ ...newEq, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2.5"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium">Brand</label>
                  <input
                    required
                    value={newEq.brand}
                    onChange={(e) =>
                      setNewEq({ ...newEq, brand: e.target.value })
                    }
                    placeholder="ARRI"
                    className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium">Model</label>
                  <input
                    required
                    value={newEq.model}
                    onChange={(e) =>
                      setNewEq({ ...newEq, model: e.target.value })
                    }
                    placeholder="Alexa Mini LF"
                    className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium">Location</label>
                  <input
                    required
                    value={newEq.location}
                    onChange={(e) =>
                      setNewEq({ ...newEq, location: e.target.value })
                    }
                    placeholder="Jashore"
                    className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium">Rental Type</label>
                  <select
                    value={newEq.rentalType}
                    onChange={(e) =>
                      setNewEq({
                        ...newEq,
                        rentalType: e.target.value as
                          | "daily"
                          | "weekly"
                          | "monthly",
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2.5"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium">
                    Rental Price (৳ / {newEq.rentalType})
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newEq.rentalPrice}
                    onChange={(e) =>
                      setNewEq({
                        ...newEq,
                        rentalPrice: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium">
                    Available Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={newEq.availableQuantity}
                    onChange={(e) =>
                      setNewEq({
                        ...newEq,
                        availableQuantity: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium">Condition</label>
                  <input
                    required
                    value={newEq.condition}
                    onChange={(e) =>
                      setNewEq({ ...newEq, condition: e.target.value })
                    }
                    placeholder="Good"
                    className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Equipment Image (imgbb Upload)
                </label>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] px-3.5 py-2 font-medium text-[var(--accent-primary)]">
                  <Upload className="h-4 w-4" />
                  <span>Select Equipment Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImgbbUpload}
                    className="hidden"
                  />
                </label>

                {newEq.image && (
                  <img
                    src={newEq.image}
                    alt="Equipment preview"
                    className="mt-3 h-28 w-40 rounded-xl border border-[var(--border-hairline)] object-cover"
                  />
                )}
              </div>

              <div>
                <label className="mb-1 block font-medium">Description</label>
                <textarea
                  rows={3}
                  required
                  value={newEq.description}
                  onChange={(e) =>
                    setNewEq({
                      ...newEq,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Rental Terms and Conditions
                </label>
                <textarea
                  rows={3}
                  required
                  value={newEq.rentalTerms}
                  onChange={(e) =>
                    setNewEq({ ...newEq, rentalTerms: e.target.value })
                  }
                  placeholder="Mention deposit, usage rules, return conditions, and other requirements."
                  className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#638df2] px-6 py-3 font-semibold text-[#0a0e14] disabled:opacity-50"
              >
                <PlusCircle className="h-4 w-4" />
                <span>
                  {actionLoading ? "Submitting..." : "Submit Equipment"}
                </span>
              </button>
            </form>
          )}

          {tab === "my-equipment" && role === "Owner" && (
            <div className="overflow-x-auto rounded-2xl specular-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)]">
                  <tr>
                    <th className="p-4">Equipment Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Rental Rate</th>
                    <th className="p-4">Condition</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {myOwnerEquipment.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-[var(--text-secondary)]"
                      >
                        You haven't listed any equipment yet.
                      </td>
                    </tr>
                  ) : (
                    myOwnerEquipment.map((item) => (
                      <tr key={getId(item)}>
                        <td className="p-4 font-semibold">{item.name}</td>
                        <td className="p-4">{item.category}</td>
                        <td className="p-4 font-mono text-[var(--accent-cyan)]">
                          ৳{item.rentalPrice} / {item.rentalType}
                        </td>
                        <td className="p-4">{item.condition}</td>
                        <td className="p-4">
                          <span className="rounded-full bg-[var(--accent-primary)]/15 px-2.5 py-0.5 text-[11px] text-[var(--accent-primary)]">
                            {formatStatus(item.status)}
                          </span>
                        </td>
                        <td className="flex gap-2 p-4">
                          <Link
                            href={`/equipment/${getId(item)}`}
                            className="rounded-lg border border-[var(--border-hairline)] px-2.5 py-1"
                          >
                            View Details
                          </Link>

                          <button
                            type="button"
                            onClick={() => deleteEquipment(getId(item))}
                            className="rounded-lg border border-rose-500/40 px-2.5 py-1 text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "owner-rentals" && role === "Owner" && (
            <div className="overflow-x-auto rounded-2xl specular-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)]">
                  <tr>
                    <th className="p-4">Customer ID</th>
                    <th className="p-4">Equipment Information</th>
                    <th className="p-4">Rental Duration</th>
                    <th className="p-4">Rental Days</th>
                    <th className="p-4">Booking Amount</th>
                    <th className="p-4">Booking Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {myOwnerRentals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-8 text-center text-[var(--text-secondary)]"
                      >
                        No rental requests yet.
                      </td>
                    </tr>
                  ) : (
                    myOwnerRentals.map((b) => (
                      <tr key={getId(b)}>
                        <td className="p-4 font-mono">{b.customerId}</td>
                        <td className="p-4 font-semibold">{b.equipmentName}</td>
                        <td className="p-4 font-mono">
                          {formatDate(b.startDate)} → {formatDate(b.endDate)}
                        </td>
                        <td className="p-4 font-mono">{b.rentalDays}</td>
                        <td className="p-4 font-mono text-[var(--accent-cyan)]">
                          ৳{b.totalAmount}
                        </td>
                        <td className="p-4">{formatStatus(b.status)}</td>
                        <td className="p-4">
                          {b.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateBookingStatus(getId(b), "accept")
                                }
                                className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-emerald-400"
                              >
                                Accept
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  updateBookingStatus(getId(b), "reject")
                                }
                                className="rounded-lg bg-rose-500/15 px-2.5 py-1 text-rose-400"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "all-users" && role === "Admin" && (
            <div className="overflow-x-auto rounded-2xl specular-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)]">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Registration Date</th>
                    <th className="p-4">Change Role</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {users.map((u) => (
                    <tr key={getId(u)}>
                      <td className="p-4 font-semibold">{u.name || "—"}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4 font-mono text-[var(--accent-primary)]">
                        {formatStatus(u.role)}
                      </td>
                      <td className="p-4 font-mono">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="p-4">
                        {getId(u) !== currentUser?.id && u.role !== "admin" && (
                          <select
                            value={u.role || "customer"}
                            onChange={(e) =>
                              changeUserRole(
                                getId(u),
                                e.target.value as "customer" | "owner",
                              )
                            }
                            className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-2.5 py-1"
                          >
                            <option value="customer">Customer</option>
                            <option value="owner">Owner</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "all-equipment" && role === "Admin" && (
            <div className="overflow-x-auto rounded-2xl specular-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)]">
                  <tr>
                    <th className="p-4">Equipment</th>
                    <th className="p-4">Owner ID</th>
                    <th className="p-4">Rental Rate</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {equipment.map((item) => (
                    <tr key={getId(item)}>
                      <td className="p-4 font-semibold">{item.name}</td>
                      <td className="p-4 font-mono">{item.ownerId}</td>
                      <td className="p-4 font-mono text-[var(--accent-cyan)]">
                        ৳{item.rentalPrice} / {item.rentalType}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            item.status === "approved"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : item.status === "rejected"
                                ? "bg-rose-500/15 text-rose-400"
                                : "bg-amber-500/15 text-amber-300"
                          }`}
                        >
                          {formatStatus(item.status)}
                        </span>
                      </td>
                      <td className="flex flex-wrap gap-2 p-4">
                        {item.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => approveEquipment(getId(item))}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2.5 py-1 text-emerald-400"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => rejectEquipment(getId(item))}
                              className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 px-2.5 py-1 text-amber-300"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        <Link
                          href={`/equipment/${getId(item)}`}
                          className="rounded-lg border border-[var(--border-hairline)] px-2.5 py-1"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "all-rentals" && role === "Admin" && (
            <div className="overflow-x-auto rounded-2xl specular-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)]">
                  <tr>
                    <th className="p-4">Customer Information</th>
                    <th className="p-4">Owner Information</th>
                    <th className="p-4">Equipment Name</th>
                    <th className="p-4">Rental Duration</th>
                    <th className="p-4">Booking Amount</th>
                    <th className="p-4">Booking Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {bookings.map((b) => (
                    <tr key={getId(b)}>
                      <td className="p-4">
                        <div className="font-semibold">
                          {getUserName(b.customerId)}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)]">
                          {b.customerId}
                        </div>
                      </td>

                      <td className="p-4">{getUserName(b.ownerId)}</td>

                      <td className="p-4 font-semibold">{b.equipmentName}</td>

                      <td className="p-4 font-mono">
                        {formatDate(b.startDate)} → {formatDate(b.endDate)}
                      </td>

                      <td className="p-4 font-mono text-[var(--accent-cyan)]">
                        ৳{b.totalAmount}
                      </td>

                      <td className="p-4">{formatStatus(b.status)}</td>

                      <td className="p-4">
                        {(b.status === "pending" ||
                          b.status === "confirmed") && (
                          <button
                            type="button"
                            onClick={() => cancelAdminBooking(getId(b))}
                            className="rounded-lg border border-rose-500/40 px-2.5 py-1 text-rose-400"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "profile" && (
            <form
              onSubmit={updateProfile}
              className="max-w-xl space-y-4 rounded-3xl specular-card p-6 text-xs sm:p-8"
            >
              <h2 className="text-lg font-bold">Profile Settings</h2>

              <div>
                <label className="mb-1 block font-medium">Name</label>
                <input
                  required
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2.5"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">Email</label>
                <input
                  disabled
                  value={currentUser?.email || ""}
                  className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)]/50 px-3.5 py-2.5 opacity-60"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Profile Image URL
                </label>
                <input
                  value={profileForm.photo}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      photo: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2.5"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#638df2] px-6 py-3 font-semibold text-[#0a0e14]"
              >
                Update Profile
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
