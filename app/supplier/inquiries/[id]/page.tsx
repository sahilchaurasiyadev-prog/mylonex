"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { ArrowLeft, LogOut } from "lucide-react";
import { useParams } from "next/navigation";
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
    description: string | null;
    gsm: number;
    weave: string;
    composition: string;
    moq: number;
  } | null;
};

export default function SupplierInquiryDetailPage() {
  const params = useParams();

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [pricePerMeter, setPricePerMeter] = useState("");
  const [dispatchTimeline, setDispatchTimeline] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [remarks, setRemarks] = useState("");

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  useEffect(() => {
    async function loadInquiry() {
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Please log in to access this page.");
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
            name,
            description,
            gsm,
            weave,
            composition,
            moq
          )
        `)
        .eq("id", params.id)
        .single();

      if (inquiryError) {
        console.error("INQUIRY ERROR:", inquiryError);
        setError("Unable to load this inquiry.");
        setLoading(false);
        return;
      }

      setInquiry(data as Inquiry);
      setLoading(false);
    }

    loadInquiry();
  }, [params.id]);

  async function handleSubmitQuote(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!inquiry) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in again.");
      setSubmitting(false);
      return;
    }

    const { error: quoteError } = await supabase
      .from("quotes")
      .insert({
        inquiry_id: inquiry.id,
        supplier_id: user.id,
        price_per_meter: Number(pricePerMeter),
        dispatch_timeline: dispatchTimeline,
        payment_terms: paymentTerms,
        remarks: remarks || null,
      });

    if (quoteError) {
      console.error("QUOTE ERROR:", quoteError);
      setError(quoteError.message);
      setSubmitting(false);
      return;
    }

    const { error: statusError } = await supabase
      .from("inquiries")
      .update({
        status: "QUOTED",
      })
      .eq("id", inquiry.id)
      .eq("status", "PENDING_QUOTE");

    if (statusError) {
      console.error("STATUS UPDATE ERROR:", statusError);

      setError(
        "Quote was submitted, but the inquiry status could not be updated. " +
        statusError.message
      );

      setSubmitting(false);
      return;
    }

    setInquiry((currentInquiry) =>
      currentInquiry
        ? {
          ...currentInquiry,
          status: "QUOTED",
        }
        : currentInquiry
    );

    setSuccess("Quote submitted successfully.");

    setPricePerMeter("");
    setDispatchTimeline("");
    setPaymentTerms("");
    setRemarks("");

    setSubmitting(false);
  }

  async function updateProductionStatus(
    nextStatus: "IN_PRODUCTION" | "DISPATCHED"
  ) {
    if (!inquiry) return;

    setUpdatingStatus(true);
    setError("");
    setSuccess("");

    const expectedCurrentStatus =
      nextStatus === "IN_PRODUCTION"
        ? "ORDER_CONFIRMED"
        : "IN_PRODUCTION";

    const { error: statusError } = await supabase
      .from("inquiries")
      .update({
        status: nextStatus,
      })
      .eq("id", inquiry.id)
      .eq("status", expectedCurrentStatus);

    if (statusError) {
      console.error("PRODUCTION STATUS ERROR:", statusError);
      setError(statusError.message);
      setUpdatingStatus(false);
      return;
    }

    setInquiry((currentInquiry) =>
      currentInquiry
        ? {
          ...currentInquiry,
          status: nextStatus,
        }
        : currentInquiry
    );

    if (nextStatus === "IN_PRODUCTION") {
      setSuccess("Order moved to production.");
    } else {
      setSuccess("Order marked as dispatched.");
    }

    setUpdatingStatus(false);
  }

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

    if (status === "QUOTED") {
      return "border-green-200 bg-green-50 text-green-700";
    }

    if (status === "ORDER_CONFIRMED") {
      return "border-blue-200 bg-blue-50 text-blue-700";
    }

    if (status === "IN_PRODUCTION") {
      return "border-purple-200 bg-purple-50 text-purple-700";
    }

    if (status === "DISPATCHED") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    return "border-zinc-200 bg-zinc-50 text-zinc-700";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-zinc-500">
            Loading inquiry...
          </p>
        </div>
      </main>
    );
  }

  if (error && !inquiry) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-red-600">{error}</p>

          <Link
            href="/supplier/inquiries"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to inquiries
          </Link>
        </div>
      </main>
    );
  }

  if (!inquiry) return null;

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Header */}
      <AppHeader role="SUPPLIER" />

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/supplier/inquiries"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to inquiries
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Inquiry details */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                inquiry.status
              )}`}
            >
              {formatStatus(inquiry.status)}
            </span>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900">
              {inquiry.fabrics?.name || "Unknown fabric"}
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              Inquiry ID: {inquiry.id}
            </p>

            {inquiry.fabrics?.description && (
              <p className="mt-6 leading-7 text-zinc-600">
                {inquiry.fabrics.description}
              </p>
            )}

            <div className="mt-8 grid gap-6 border-y border-zinc-100 py-6 sm:grid-cols-2">
              <div>
                <p className="text-xs text-zinc-400">
                  Requested quantity
                </p>

                <p className="mt-1 font-medium text-zinc-900">
                  {inquiry.quantity.toLocaleString()} m
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-400">
                  Target price
                </p>

                <p className="mt-1 font-medium text-zinc-900">
                  {inquiry.target_price !== null
                    ? `₹${inquiry.target_price} / m`
                    : "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-400">
                  Required dispatch
                </p>

                <p className="mt-1 font-medium text-zinc-900">
                  {formatDate(inquiry.required_dispatch_date)}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-400">
                  Delivery location
                </p>

                <p className="mt-1 font-medium text-zinc-900">
                  {inquiry.delivery_location}
                </p>
              </div>
            </div>

            {inquiry.fabrics && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Fabric specifications
                </h2>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-zinc-400">GSM</p>

                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {inquiry.fabrics.gsm}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400">Weave</p>

                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {inquiry.fabrics.weave}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400">
                      Composition
                    </p>

                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {inquiry.fabrics.composition}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400">
                      Minimum order
                    </p>

                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {inquiry.fabrics.moq.toLocaleString()} m
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Action panel */}
          <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            {/* PENDING QUOTE */}
            {inquiry.status === "PENDING_QUOTE" && (
              <>
                <h2 className="text-xl font-semibold text-zinc-900">
                  Submit a quote
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Provide your best commercial offer for this inquiry.
                </p>

                <form
                  onSubmit={handleSubmitQuote}
                  className="mt-6 space-y-5"
                >
                  {/* Price */}
                  <div>
                    <label
                      htmlFor="price"
                      className="mb-2 block text-sm font-medium text-zinc-900"
                    >
                      Price per meter
                    </label>

                    <input
                      id="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={pricePerMeter}
                      onChange={(event) =>
                        setPricePerMeter(event.target.value)
                      }
                      placeholder="₹0.00"
                      required
                      className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                    />
                  </div>

                  {/* Dispatch timeline */}
                  <div>
                    <label
                      htmlFor="dispatchTimeline"
                      className="mb-2 block text-sm font-medium text-zinc-900"
                    >
                      Dispatch timeline
                    </label>

                    <input
                      id="dispatchTimeline"
                      type="text"
                      value={dispatchTimeline}
                      onChange={(event) =>
                        setDispatchTimeline(event.target.value)
                      }
                      placeholder="e.g. 7-10 working days"
                      required
                      className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                    />
                  </div>

                  {/* Payment terms */}
                  <div>
                    <label
                      htmlFor="paymentTerms"
                      className="mb-2 block text-sm font-medium text-zinc-900"
                    >
                      Payment terms
                    </label>

                    <input
                      id="paymentTerms"
                      type="text"
                      value={paymentTerms}
                      onChange={(event) =>
                        setPaymentTerms(event.target.value)
                      }
                      placeholder="e.g. 50% advance, 50% before dispatch"
                      required
                      className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                    />
                  </div>

                  {/* Remarks */}
                  <div>
                    <label
                      htmlFor="remarks"
                      className="mb-2 block text-sm font-medium text-zinc-900"
                    >
                      Remarks
                    </label>

                    <textarea
                      id="remarks"
                      rows={4}
                      value={remarks}
                      onChange={(event) =>
                        setRemarks(event.target.value)
                      }
                      placeholder="Add any commercial or production notes..."
                      className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-zinc-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting
                      ? "Submitting quote..."
                      : "Submit Quote"}
                  </button>
                </form>
              </>
            )}

            {/* QUOTED */}
            {inquiry.status === "QUOTED" && (
              <>
                <h2 className="text-xl font-semibold text-zinc-900">
                  Quote submitted
                </h2>

                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <p className="text-sm font-medium text-green-700">
                    Quote already submitted
                  </p>

                  <p className="mt-1 text-xs leading-5 text-green-600">
                    This inquiry has received your supplier quote.
                    Waiting for the buyer to accept or reject it.
                  </p>
                </div>
              </>
            )}

            {/* ORDER CONFIRMED */}
            {inquiry.status === "ORDER_CONFIRMED" && (
              <>
                <h2 className="text-xl font-semibold text-zinc-900">
                  Order confirmed
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  The buyer has accepted the quote. You can now move
                  the order into production.
                </p>

                {error && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                  </div>
                )}

                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() =>
                    updateProductionStatus("IN_PRODUCTION")
                  }
                  className="mt-6 w-full rounded-xl bg-zinc-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingStatus
                    ? "Updating..."
                    : "Start Production"}
                </button>
              </>
            )}

            {/* IN PRODUCTION */}
            {inquiry.status === "IN_PRODUCTION" && (
              <>
                <h2 className="text-xl font-semibold text-zinc-900">
                  Order in production
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Production is currently in progress. Mark the order
                  as dispatched once it has been shipped.
                </p>

                {error && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                  </div>
                )}

                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() =>
                    updateProductionStatus("DISPATCHED")
                  }
                  className="mt-6 w-full rounded-xl bg-zinc-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingStatus
                    ? "Updating..."
                    : "Mark as Dispatched"}
                </button>
              </>
            )}

            {/* DISPATCHED */}
            {inquiry.status === "DISPATCHED" && (
              <>
                <h2 className="text-xl font-semibold text-zinc-900">
                  Order dispatched
                </h2>

                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <p className="text-sm font-medium text-green-700">
                    Dispatched successfully
                  </p>

                  <p className="mt-1 text-xs leading-5 text-green-600">
                    This order has completed the production lifecycle.
                  </p>
                </div>
              </>
            )}

            {/* REJECTED */}
            {inquiry.status === "REJECTED" && (
              <>
                <h2 className="text-xl font-semibold text-zinc-900">
                  Quote rejected
                </h2>

                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-700">
                    Quote was rejected
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-600">
                    The buyer has rejected the supplier quote for this inquiry.
                    No further action is required.
                  </p>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}