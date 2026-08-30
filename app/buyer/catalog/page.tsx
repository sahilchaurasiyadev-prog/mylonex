"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { Search, SlidersHorizontal, ArrowRight } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Fabric = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  gsm: number;
  weave: string;
  composition: string;
  width: number | null;
  moq: number;
  production_status: string;
  dispatch_min_days: number;
  dispatch_max_days: number;
  certifications: string[];
};

const statusOptions = [
  { value: "ALL", label: "All production" },
  { value: "READY_STOCK", label: "Ready Stock" },
  { value: "RUNNING_PRODUCTION", label: "Running Production" },
  { value: "MADE_TO_ORDER", label: "Made to Order" },
];

function getStatusLabel(status: string) {
  switch (status) {
    case "READY_STOCK":
      return "Ready Stock";
    case "RUNNING_PRODUCTION":
      return "Running Production";
    case "MADE_TO_ORDER":
      return "Made to Order";
    default:
      return status;
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case "READY_STOCK":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "RUNNING_PRODUCTION":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "MADE_TO_ORDER":
      return "bg-orange-50 text-orange-700 border-orange-200";
    default:
      return "bg-zinc-50 text-zinc-700 border-zinc-200";
  }
}

export default function CatalogPage() {
  const router = useRouter();

  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setSearch(params.get("search") || "");
    setStatus(params.get("status") || "ALL");

    async function loadFabrics() {
      const { data, error } = await supabase
        .from("fabrics")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error) {
        setFabrics(data || []);
      }

      setLoading(false);
    }

    loadFabrics();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (status !== "ALL") params.set("status", status);

    const query = params.toString();

    window.history.replaceState(
      null,
      "",
      query ? `/buyer/catalog?${query}` : "/buyer/catalog"
    );
  }, [search, status]);

  const filteredFabrics = useMemo(() => {
    return fabrics.filter((fabric) => {
      const matchesSearch =
        !search ||
        fabric.name.toLowerCase().includes(search.toLowerCase()) ||
        fabric.composition.toLowerCase().includes(search.toLowerCase()) ||
        fabric.weave.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        status === "ALL" || fabric.production_status === status;

      return matchesSearch && matchesStatus;
    });
  }, [fabrics, search, status]);

  return (
    <main className="min-h-screen bg-[#f7f7f8]">
      {/* Header */}
      <AppHeader role="BUYER" />

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Heading */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-zinc-500">
            Fabric marketplace
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Source fabrics with confidence.
          </h1>

          <p className="mt-2 max-w-2xl text-zinc-500">
            Discover production-ready textiles with transparent specifications,
            minimum quantities, certifications, and dispatch timelines.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              type="text"
              placeholder="Search fabrics, composition, weave..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-zinc-400 focus:bg-white"
            />
          </div>

          <div className="relative md:w-56">
            <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none focus:border-zinc-400"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {loading
              ? "Loading fabrics..."
              : `${filteredFabrics.length} fabrics available`}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-2xl border border-zinc-200 bg-white"
              />
            ))}
          </div>
        ) : filteredFabrics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
            <h3 className="font-medium text-zinc-900">
              No fabrics found
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Try changing your search or production filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredFabrics.map((fabric) => (
              <article
                key={fabric.id}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Visual */}
                <div className="relative h-40 overflow-hidden bg-zinc-100">
                  {fabric.image_url ? (
                    <img
                      src={fabric.image_url}
                      alt={fabric.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-zinc-100" />
                  )}

                  <div className="absolute left-5 top-5">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                        fabric.production_status
                      )}`}
                    >
                      {getStatusLabel(fabric.production_status)}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {fabric.name}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                    {fabric.description}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-y-4 border-y border-zinc-100 py-4">
                    <div>
                      <p className="text-xs text-zinc-400">GSM</p>
                      <p className="mt-1 text-sm font-medium text-zinc-800">
                        {fabric.gsm}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-400">Weave</p>
                      <p className="mt-1 text-sm font-medium text-zinc-800">
                        {fabric.weave}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-400">Composition</p>
                      <p className="mt-1 text-sm font-medium text-zinc-800">
                        {fabric.composition}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-400">Width</p>
                      <p className="mt-1 text-sm font-medium text-zinc-800">
                        {fabric.width ? `${fabric.width}"` : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-zinc-400">Minimum order</p>
                      <p className="mt-1 text-sm font-semibold text-zinc-900">
                        {fabric.moq.toLocaleString()}m
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-zinc-400">Dispatch</p>
                      <p className="mt-1 text-sm font-medium text-zinc-700">
                        {fabric.dispatch_min_days}–{fabric.dispatch_max_days} days
                      </p>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {fabric.certifications.map((certification) => (
                      <span
                        key={certification}
                        className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-600"
                      >
                        {certification}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/buyer/catalog/${fabric.id}`}
                    className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
                  >
                    View fabric
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}