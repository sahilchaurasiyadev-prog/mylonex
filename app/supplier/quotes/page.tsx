"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Quote = {
  id: string;
  inquiry_id: string;
  supplier_id: string;
  price_per_meter: number;
  dispatch_timeline: string;
  payment_terms: string;
  remarks: string | null;
  created_at: string;
  inquiries: {
    id: string;
    fabric_id: string;
    type: string;
    quantity: number;
    target_price: number | null;
    required_dispatch_date: string;
    delivery_location: string;
    status: string;
    fabrics: {
      name: string;
    } | null;
  } | null;
};

export default function SupplierQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  useEffect(() => {
    async function loadQuotes() {
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Please log in to access your quotes.");
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

      const { data, error: quoteError } = await supabase
        .from("quotes")
        .select(`
          id,
          inquiry_id,
          supplier_id,
          price_per_meter,
          dispatch_timeline,
          payment_terms,
          remarks,
          created_at,
          inquiries (
            id,
            fabric_id,
            type,
            quantity,
            target_price,
            required_dispatch_date,
            delivery_location,
            status,
            fabrics (
              name
            )
          )
        `)
        .eq("supplier_id", user.id)
        .order("created_at", { ascending: false });

      if (quoteError) {
        console.error("QUOTE ERROR:", quoteError);
        setError(quoteError.message);
        setLoading(false);
        return;
      }

      const normalizedQuotes = (data || []).map((quote) => {
        const inquiry = Array.isArray(quote.inquiries)
          ? quote.inquiries[0] || null
          : quote.inquiries;

        return {
          ...quote,
          inquiries: inquiry
            ? {
              ...inquiry,
              fabrics: Array.isArray(inquiry.fabrics)
                ? inquiry.fabrics[0] || null
                : inquiry.fabrics,
            }
            : null,
        };
      });

      setQuotes(normalizedQuotes as Quote[]);
      setLoading(false);
    }

    loadQuotes();
  }, []);

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
    if (status === "ORDER_CONFIRMED") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (status === "REJECTED") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    if (status === "QUOTED") {
      return "border-blue-200 bg-blue-50 text-blue-700";
    }

    return "border-gray-200 bg-gray-50 text-gray-700";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-zinc-500">
            Loading your quotes...
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
            My quotes
          </h1>

          <p className="mt-2 text-zinc-500">
            Track quotes you have submitted and see the buyer's decision.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!error && quotes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-zinc-900">
              No quotes yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              You haven't submitted any supplier quotes yet.
            </p>

            <Link
              href="/supplier/inquiries"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Browse open inquiries
            </Link>
          </div>
        )}

        {!error && quotes.length > 0 && (
          <div className="space-y-5">
            {quotes.map((quote) => {
              const inquiry = quote.inquiries;

              return (
                <article
                  key={quote.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                          inquiry?.status || ""
                        )}`}
                      >
                        {inquiry
                          ? formatStatus(inquiry.status)
                          : "Unknown Status"}
                      </span>

                      <h2 className="mt-3 text-xl font-semibold text-zinc-900">
                        {inquiry?.fabrics?.name || "Unknown fabric"}
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500">
                        Inquiry ID: {quote.inquiry_id}
                      </p>
                    </div>

                    {inquiry && (
                      <Link
                        href={`/supplier/inquiries/${inquiry.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                      >
                        View Inquiry
                      </Link>
                    )}
                  </div>

                  <div className="mt-6 grid gap-5 border-t border-zinc-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-zinc-400">
                        Your price
                      </p>

                      <p className="mt-1 text-sm font-semibold text-zinc-900">
                        ₹
                        {quote.price_per_meter.toLocaleString(
                          "en-IN"
                        )}{" "}
                        / m
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-400">
                        Quantity
                      </p>

                      <p className="mt-1 text-sm font-medium text-zinc-900">
                        {inquiry?.quantity.toLocaleString() || "-"} m
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-400">
                        Dispatch timeline
                      </p>

                      <p className="mt-1 text-sm font-medium text-zinc-900">
                        {quote.dispatch_timeline}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-400">
                        Submitted
                      </p>

                      <p className="mt-1 text-sm font-medium text-zinc-900">
                        {formatDate(quote.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5 border-t border-zinc-100 pt-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-zinc-400">
                        Payment terms
                      </p>

                      <p className="mt-1 text-sm text-zinc-700">
                        {quote.payment_terms}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-400">
                        Delivery location
                      </p>

                      <p className="mt-1 text-sm text-zinc-700">
                        {inquiry?.delivery_location || "-"}
                      </p>
                    </div>
                  </div>

                  {quote.remarks && (
                    <div className="mt-5 border-t border-zinc-100 pt-5">
                      <p className="text-xs text-zinc-400">
                        Your remarks
                      </p>

                      <p className="mt-1 text-sm leading-6 text-zinc-700">
                        {quote.remarks}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}