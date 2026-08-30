"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Fabric = {
  id: string;
  name: string;
  moq: number;
};

type InquiryType = "SAMPLE_REQUEST" | "BULK_RFQ";

const SAMPLE_MIN_QUANTITY = 1;

export default function InquiryPage() {
  const params = useParams();
  const router = useRouter();

  const [fabric, setFabric] = useState<Fabric | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState<InquiryType>("BULK_RFQ");
  const [quantity, setQuantity] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [dispatchDate, setDispatchDate] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");

  const [error, setError] = useState("");

  const minQuantity =
    type === "SAMPLE_REQUEST" ? SAMPLE_MIN_QUANTITY : fabric?.moq ?? 1;

  useEffect(() => {
    async function loadFabric() {
      const { data, error } = await supabase
        .from("fabrics")
        .select("id, name, moq")
        .eq("id", params.id)
        .single();

      if (error) {
        setError("Unable to load fabric.");
      } else {
        setFabric(data);
      }

      setLoading(false);
    }

    loadFabric();
  }, [params.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in before submitting an inquiry.");
      return;
    }

    if (!fabric) {
      setError("Fabric information is unavailable.");
      return;
    }

    const requestedQuantity = Number(quantity);

    if (!requestedQuantity || requestedQuantity <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (requestedQuantity < minQuantity) {
      setError(
        type === "SAMPLE_REQUEST"
          ? `Minimum sample quantity is ${minQuantity}m.`
          : `Minimum order quantity for this fabric is ${minQuantity.toLocaleString()}m.`
      );
      return;
    }

    if (!dispatchDate) {
      setError("Please select a required dispatch date.");
      return;
    }

    if (!deliveryLocation.trim()) {
      setError("Please enter a delivery location.");
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase
      .from("inquiries")
      .insert({
        buyer_id: user.id,
        fabric_id: fabric.id,
        type,
        quantity: requestedQuantity,
        target_price: targetPrice ? Number(targetPrice) : null,
        required_dispatch_date: dispatchDate,
        delivery_location: deliveryLocation.trim(),
        status: "PENDING_QUOTE",
      });

    if (insertError) {
      console.error("INQUIRY INSERT ERROR:", insertError);
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    router.push("/buyer/inquiries");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </main>
    );
  }

  if (!fabric) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-red-500">
            {error || "Fabric not found."}
          </p>

          <Link
            href="/buyer/catalog"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to catalog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/buyer/catalog"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white">
              M
            </div>

            <span className="text-lg font-semibold text-zinc-900">
              MyloNex
            </span>
          </Link>

          <Link
            href="/buyer/inquiries"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            My Inquiries
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href={`/buyer/catalog/${fabric.id}`}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to fabric
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <p className="text-sm text-zinc-500">Fabric inquiry</p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              {fabric.name}
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              Submit a sample request or bulk production RFQ.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Inquiry Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-900">
                Inquiry Type
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("SAMPLE_REQUEST")}
                  className={`rounded-xl border px-4 py-4 text-left transition ${type === "SAMPLE_REQUEST"
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400"
                    }`}
                >
                  <p className="font-medium">Sample Request</p>
                  <p
                    className={`mt-1 text-xs ${type === "SAMPLE_REQUEST"
                      ? "text-zinc-300"
                      : "text-zinc-500"
                      }`}
                  >
                    Request fabric samples
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setType("BULK_RFQ")}
                  className={`rounded-xl border px-4 py-4 text-left transition ${type === "BULK_RFQ"
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400"
                    }`}
                >
                  <p className="font-medium">Bulk Production RFQ</p>
                  <p
                    className={`mt-1 text-xs ${type === "BULK_RFQ"
                      ? "text-zinc-300"
                      : "text-zinc-500"
                      }`}
                  >
                    Request production pricing
                  </p>
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label
                htmlFor="quantity"
                className="mb-2 block text-sm font-medium text-zinc-900"
              >
                Quantity (meters)
              </label>

              <input
                id="quantity"
                type="number"
                min={minQuantity}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder={`Minimum ${minQuantity.toLocaleString()}m`}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                required
              />

              <p className="mt-2 text-xs text-zinc-500">
                {type === "SAMPLE_REQUEST"
                  ? "Minimum sample quantity:"
                  : "Minimum order quantity:"}{" "}
                <span className="font-medium text-zinc-700">
                  {minQuantity.toLocaleString()}m
                </span>
              </p>
            </div>

            {/* Target Price */}
            <div>
              <label
                htmlFor="targetPrice"
                className="mb-2 block text-sm font-medium text-zinc-900"
              >
                Target Price per Meter
                <span className="ml-1 font-normal text-zinc-400">
                  (optional)
                </span>
              </label>

              <input
                id="targetPrice"
                type="number"
                min="0"
                step="0.01"
                value={targetPrice}
                onChange={(event) =>
                  setTargetPrice(event.target.value)
                }
                placeholder="e.g. 180"
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
              />
            </div>

            {/* Dispatch Date */}
            <div>
              <label
                htmlFor="dispatchDate"
                className="mb-2 block text-sm font-medium text-zinc-900"
              >
                Required Dispatch Date
              </label>

              <input
                id="dispatchDate"
                type="date"
                value={dispatchDate}
                onChange={(event) =>
                  setDispatchDate(event.target.value)
                }
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                required
              />
            </div>

            {/* Delivery Location */}
            <div>
              <label
                htmlFor="deliveryLocation"
                className="mb-2 block text-sm font-medium text-zinc-900"
              >
                Delivery Location
              </label>

              <textarea
                id="deliveryLocation"
                value={deliveryLocation}
                onChange={(event) =>
                  setDeliveryLocation(event.target.value)
                }
                placeholder="Enter city, state and delivery address"
                rows={4}
                className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-zinc-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting..."
                : type === "SAMPLE_REQUEST"
                  ? "Submit Sample Request"
                  : "Submit RFQ"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}