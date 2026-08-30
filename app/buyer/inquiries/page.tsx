"use client";

import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";
import { Check, LogOut, X } from "lucide-react";
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
};

type Inquiry = {
  id: string;
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
  quotes: Quote[];
};

const lifecycleSteps = [
  {
    status: "PENDING_QUOTE",
    label: "RFQ Submitted",
  },
  {
    status: "QUOTED",
    label: "Quote Received",
  },
  {
    status: "ORDER_CONFIRMED",
    label: "Order Confirmed",
  },
  {
    status: "IN_PRODUCTION",
    label: "In Production",
  },
  {
    status: "DISPATCHED",
    label: "Dispatched",
  },
];

export default function BuyerInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInquiries();
  }, []);

  async function loadInquiries() {
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in to view your inquiries.");
      setLoading(false);
      return;
    }

    const { data, error: inquiryError } = await supabase
      .from("inquiries")
      .select(
        `
        id,
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
        ),
        quotes (
          id,
          inquiry_id,
          supplier_id,
          price_per_meter,
          dispatch_timeline,
          payment_terms,
          remarks,
          created_at
        )
      `
      )
      .eq("buyer_id", user.id)
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

  async function handleQuoteAction(
    inquiryId: string,
    action: "ACCEPT" | "REJECT"
  ) {
    setActionLoading(inquiryId);
    setError("");

    const newStatus =
      action === "ACCEPT" ? "ORDER_CONFIRMED" : "REJECTED";

    const { error: updateError } = await supabase
      .from("inquiries")
      .update({
        status: newStatus,
      })
      .eq("id", inquiryId);

    if (updateError) {
      console.error("STATUS UPDATE ERROR:", updateError);
      setError(updateError.message);
      setActionLoading(null);
      return;
    }

    await loadInquiries();
    setActionLoading(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function formatStatus(status: string) {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function getStepIndex(status: string) {
    return lifecycleSteps.findIndex((step) => step.status === status);
  }

  return (
    <main className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <AppHeader role="BUYER" />

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <p className="mb-2 text-sm text-[#65748b]">
            Buyer workspace
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-[#111827]">
            My inquiries
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-[#65748b]">
            Track your fabric inquiries, requested quantities, target prices,
            and supplier responses.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
            <p className="text-[#65748b]">Loading inquiries...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && inquiries.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">
            <h2 className="text-xl font-semibold text-[#111827]">
              No inquiries yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#65748b]">
              You haven't submitted any fabric inquiries yet. Browse the
              catalog to find a fabric and submit your first inquiry.
            </p>

            <Link
              href="/buyer/catalog"
              className="mt-6 inline-flex rounded-lg bg-[#171717] px-5 py-3 text-sm font-medium text-white hover:bg-[#2a2a2a]"
            >
              Browse fabrics
            </Link>
          </div>
        )}

        {/* Inquiries */}
        {!loading && inquiries.length > 0 && (
          <div className="space-y-6">
            {inquiries.map((inquiry) => {
              const currentStep = getStepIndex(inquiry.status);
              const hasQuotes = inquiry.quotes?.length > 0;
              const canTakeAction =
                inquiry.status === "QUOTED" && hasQuotes;

              return (
                <div
                  key={inquiry.id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-7"
                >
                  {/* Top */}
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-[#65748b]">
                        Fabric
                      </p>

                      <h2 className="mt-1 text-xl font-semibold text-[#111827]">
                        {inquiry.fabrics?.name || "Fabric"}
                      </h2>

                      <p className="mt-2 text-sm text-[#65748b]">
                        Inquiry ID: {inquiry.id}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-sm font-medium ${
                        inquiry.status === "REJECTED"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : inquiry.status === "ORDER_CONFIRMED"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 bg-gray-50 text-[#374151]"
                      }`}
                    >
                      {formatStatus(inquiry.status)}
                    </span>
                  </div>

                  {/* Lifecycle Stepper */}
                  {inquiry.status !== "REJECTED" && (
                    <div className="mt-8 border-y border-gray-100 py-7">
                      <p className="mb-6 text-sm font-semibold text-[#111827]">
                        Order lifecycle
                      </p>

                      <div className="grid grid-cols-5 gap-2">
                        {lifecycleSteps.map((step, index) => {
                          const completed =
                            currentStep >= 0 && index <= currentStep;

                          const active = index === currentStep;

                          return (
                            <div
                              key={step.status}
                              className="relative text-center"
                            >
                              <div className="flex items-center">
                                <div
                                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                                    completed
                                      ? "border-[#171717] bg-[#171717] text-white"
                                      : "border-gray-200 bg-white text-gray-400"
                                  }`}
                                >
                                  {index + 1}
                                </div>
                              </div>

                              <p
                                className={`mt-2 text-xs leading-5 ${
                                  active
                                    ? "font-semibold text-[#111827]"
                                    : completed
                                      ? "font-medium text-[#374151]"
                                      : "text-gray-400"
                                }`}
                              >
                                {step.label}
                              </p>

                              {index < lifecycleSteps.length - 1 && (
                                <div
                                  className={`absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-4 h-0.5 ${
                                    currentStep > index
                                      ? "bg-[#171717]"
                                      : "bg-gray-200"
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Inquiry Details */}
                  <div className="mt-6 grid gap-5 border-b border-gray-100 pb-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-[#65748b]">
                        Inquiry type
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#111827]">
                        {formatStatus(inquiry.type)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#65748b]">
                        Quantity
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#111827]">
                        {inquiry.quantity.toLocaleString()} m
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#65748b]">
                        Target price
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#111827]">
                        {inquiry.target_price !== null
                          ? `₹${inquiry.target_price.toLocaleString("en-IN")}`
                          : "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#65748b]">
                        Required dispatch
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#111827]">
                        {new Date(
                          inquiry.required_dispatch_date
                        ).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Delivery */}
                  <div className="mt-5 border-b border-gray-100 pb-6">
                    <p className="text-xs text-[#65748b]">
                      Delivery location
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#111827]">
                      {inquiry.delivery_location}
                    </p>
                  </div>

                  {/* Supplier Quotes */}
                  <div className="mt-6">
                    <div>
                      <h3 className="text-lg font-semibold text-[#111827]">
                        Supplier quotes
                      </h3>

                      <p className="mt-1 text-sm text-[#65748b]">
                        {inquiry.quotes?.length || 0} quote
                        {inquiry.quotes?.length === 1 ? "" : "s"} received
                      </p>
                    </div>

                    {hasQuotes ? (
                      <div className="mt-5 space-y-4">
                        {inquiry.quotes.map((quote) => (
                          <div
                            key={quote.id}
                            className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                          >
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                              <div>
                                <p className="text-xs text-[#65748b]">
                                  Price per meter
                                </p>

                                <p className="mt-1 text-lg font-semibold text-[#111827]">
                                  ₹
                                  {quote.price_per_meter.toLocaleString(
                                    "en-IN"
                                  )}
                                </p>

                                {inquiry.target_price !== null && (
                                  <p
                                    className={`mt-1 text-xs ${
                                      quote.price_per_meter <=
                                      inquiry.target_price
                                        ? "text-emerald-600"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {quote.price_per_meter <=
                                    inquiry.target_price
                                      ? "Within target price"
                                      : "Above target price"}
                                  </p>
                                )}
                              </div>

                              <div>
                                <p className="text-xs text-[#65748b]">
                                  Dispatch timeline
                                </p>

                                <p className="mt-1 text-sm font-medium text-[#111827]">
                                  {quote.dispatch_timeline}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-[#65748b]">
                                  Payment terms
                                </p>

                                <p className="mt-1 text-sm font-medium text-[#111827]">
                                  {quote.payment_terms}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-[#65748b]">
                                  Quote submitted
                                </p>

                                <p className="mt-1 text-sm font-medium text-[#111827]">
                                  {new Date(
                                    quote.created_at
                                  ).toLocaleDateString("en-IN")}
                                </p>
                              </div>
                            </div>

                            {quote.remarks && (
                              <div className="mt-5 border-t border-gray-200 pt-4">
                                <p className="text-xs text-[#65748b]">
                                  Supplier remarks
                                </p>

                                <p className="mt-1 text-sm leading-6 text-[#374151]">
                                  {quote.remarks}
                                </p>
                              </div>
                            )}

                            {/* Accept / Reject */}
                            {canTakeAction && (
                              <div className="mt-5 flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                                <button
                                  onClick={() =>
                                    handleQuoteAction(
                                      inquiry.id,
                                      "REJECT"
                                    )
                                  }
                                  disabled={
                                    actionLoading === inquiry.id
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <X className="h-4 w-4" />
                                  Reject Quote
                                </button>

                                <button
                                  onClick={() =>
                                    handleQuoteAction(
                                      inquiry.id,
                                      "ACCEPT"
                                    )
                                  }
                                  disabled={
                                    actionLoading === inquiry.id
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#171717] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Check className="h-4 w-4" />

                                  {actionLoading === inquiry.id
                                    ? "Updating..."
                                    : "Accept Quote"}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-dashed border-gray-300 px-5 py-6">
                        <p className="text-sm text-[#65748b]">
                          No supplier quotes received yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}