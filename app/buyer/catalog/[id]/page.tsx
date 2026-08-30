"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Fabric = {
  id: string;
  name: string;
  image_url: string | null;
  description: string | null;
  gsm: number;
  weave: string;
  composition: string;
  width: number | null;
  moq: number;
  production_status: string;
  dispatch_min_days: number;
  dispatch_max_days: number;
  certifications: string[] | null;
};

export default function FabricDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [fabric, setFabric] = useState<Fabric | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFabric() {
      const { data, error } = await supabase
        .from("fabrics")
        .select("*")
        .eq("id", params.id)
        .single();

      console.log("FABRIC:", data);
      console.log("SUPABASE ERROR:", error);

      if (error) {
        setError("Unable to load fabric.");
      } else {
        setFabric(data);
      }

      setLoading(false);
    }

    loadFabric();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-zinc-500">Loading fabric...</p>
        </div>
      </main>
    );
  }

  if (error || !fabric) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
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
      {/* Header */}
      <AppHeader role="BUYER" />

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/buyer/catalog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to catalog
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Fabric information */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="mb-8 h-56 overflow-hidden rounded-2xl bg-zinc-100">
              {fabric.image_url ? (
                <img
                  src={fabric.image_url}
                  alt={fabric.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-zinc-100" />
              )}
            </div>

            <div>
              <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
                {fabric.production_status.replaceAll("_", " ")}
              </span>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900">
                {fabric.name}
              </h1>

              <p className="mt-4 leading-7 text-zinc-500">
                {fabric.description}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6 border-y border-zinc-100 py-6">
              <div>
                <p className="text-xs text-zinc-400">GSM</p>
                <p className="mt-1 font-medium text-zinc-900">
                  {fabric.gsm}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-400">Weave</p>
                <p className="mt-1 font-medium text-zinc-900">
                  {fabric.weave}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-400">Composition</p>
                <p className="mt-1 font-medium text-zinc-900">
                  {fabric.composition}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-400">Width</p>
                <p className="mt-1 font-medium text-zinc-900">
                  {fabric.width ? `${fabric.width}"` : "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-400">Minimum order</p>
                <p className="mt-1 font-medium text-zinc-900">
                  {fabric.moq.toLocaleString()}m
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-400">Dispatch</p>
                <p className="mt-1 font-medium text-zinc-900">
                  {fabric.dispatch_min_days}–
                  {fabric.dispatch_max_days} days
                </p>
              </div>
            </div>

            {fabric.certifications &&
              fabric.certifications.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-xs text-zinc-400">
                    Certifications
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {fabric.certifications.map((certification) => (
                      <span
                        key={certification}
                        className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600"
                      >
                        {certification}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </section>

          {/* Inquiry CTA */}
          <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">
              Interested in this fabric?
            </p>

            <h2 className="mt-2 text-xl font-semibold text-zinc-900">
              Start an inquiry
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Request a sample or submit a bulk production RFQ
              for this fabric.
            </p>

            <Link
              href={`/buyer/catalog/${fabric.id}/inquiry`}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Request Sample / Quote
            </Link>

            <div className="mt-5 border-t border-zinc-100 pt-5">
              <p className="text-xs text-zinc-400">
                Minimum order
              </p>

              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {fabric.moq.toLocaleString()}m
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}