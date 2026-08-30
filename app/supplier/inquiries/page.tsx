"use client";

import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";
import { ArrowRight, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Inquiry = {
  id: string;
  buyer_id: string;
  fabric_id: string;
  type: string;
  quantity: number;
  target_price: number | null;
  required_dispatch_date: string;
  delivery_location: string;
  status: string;
  created_at: string;
  fabrics: {
    name: string;
  } | null;
};

export default function SupplierInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  useEffect(() => {
    async function loadInquiries() {
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Please log in to access the supplier dashboard.");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("PROFILE ERROR:", profileError);
        setError("Unable to verify your account role.");
        setLoading(false);
        return;
      }

      if (profile.role !== "SUPPLIER") {
        setError("This page is only available to suppliers.");
        setLoading(false);
        return;
      }

      const { data, error: inquiryError } = await supabase
        .from("inquiries")
        .select(`
          id,
          buyer_id,
          fabric_id,
          type,
          quantity,
          target_price,
          required_dispatch_date,
          delivery_location,
          status,
          created_at,
          fabrics (
            name
          )
        `)
        .in(
          "status",
          ["PENDING_QUOTE", "ORDER_CONFIRMED", "IN_PRODUCTION"]
        )
        .order("created_at", { ascending: false });

      if (inquiryError) {
        console.error("INQUIRY ERROR:", inquiryError);
        setError(inquiryError.message);
        setLoading(false);
        return;
      }

      setInquiries((data as Inquiry[]) || []);
      setLoading(false);
    }

    loadInquiries();
  }, []);

  function formatType(type: string) {
    if (type === "BULK_RFQ") return "Bulk RFQ";
    if (type === "SAMPLE_REQUEST") return "Sample Request";

    return type.replaceAll("_", " ");
  }

  function formatStatus(status: string) {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getStatusClasses(status: string) {
    if (status === "PENDING_QUOTE") {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    if (status === "ORDER_CONFIRMED") {
      return "border-blue-200 bg-blue-50 text-blue-700";
    }

    if (status === "IN_PRODUCTION") {
      return "border-purple-200 bg-purple-50 text-purple-700";
    }

    return "border-zinc-200 bg-zinc-50 text-zinc-700";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-zinc-500">
            Loading supplier inquiries...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Header */}
      <AppHeader role="SUPPLIER" />

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium text-zinc-500">
            Supplier workspace
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Incoming inquiries
          </h1>

          <p className="mt-2 text-zinc-500">
            Review buyer requests, submit quotes, and manage production.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!error && inquiries.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-zinc-900">
              No active inquiries
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              There are currently no inquiries requiring supplier action.
            </p>
          </div>
        )}

        {!error && inquiries.length > 0 && (
          <div className="space-y-5">
            {inquiries.map((inquiry) => (
              <article
                key={inquiry.id}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                        inquiry.status
                      )}`}
                    >
                      {formatStatus(inquiry.status)}
                    </span>

                    <h2 className="mt-3 text-xl font-semibold text-zinc-900">
                      {inquiry.fabrics?.name || "Unknown fabric"}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Inquiry ID: {inquiry.id}
                    </p>
                  </div>

                  <Link
                    href={`/supplier/inquiries/${inquiry.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
                  >
                    {inquiry.status === "PENDING_QUOTE"
                      ? "Review & Quote"
                      : "Manage Order"}

                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-6 grid gap-5 border-t border-zinc-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-zinc-400">
                      Inquiry type
                    </p>

                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {formatType(inquiry.type)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400">
                      Quantity
                    </p>

                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {inquiry.quantity.toLocaleString()} m
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400">
                      Target price
                    </p>

                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {inquiry.target_price !== null
                        ? `₹${inquiry.target_price}`
                        : "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400">
                      Required dispatch
                    </p>

                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {formatDate(inquiry.required_dispatch_date)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-zinc-100 pt-5">
                  <p className="text-xs text-zinc-400">
                    Delivery location
                  </p>

                  <p className="mt-1 text-sm text-zinc-700">
                    {inquiry.delivery_location}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}