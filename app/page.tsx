import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7f8]">
      <div className="flex min-h-screen">
        {/* Left side */}
        <section className="hidden w-1/2 flex-col justify-between bg-[#18181b] p-10 text-white lg:flex">
          <div>
            <div className="flex items-center gap-2 text-xl font-semibold">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-[#18181b]">
                M
              </div>
              MyloNex
            </div>
          </div>

          <div className="max-w-lg">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300">
              <Sparkles className="h-4 w-4" />
              Textile sourcing, simplified
            </div>

            <h1 className="text-5xl font-semibold leading-tight tracking-tight">
              Source better fabrics.
              <br />
              Build better products.
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-zinc-400">
              Connect with textile suppliers, submit structured RFQs, compare
              quotations, and track production from one place.
            </p>
          </div>

          <p className="text-sm text-zinc-500">
            MyloNex Lite · B2B Textile Sourcing Platform
          </p>
        </section>

        {/* Right side */}
        <section className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white">
                  M
                </div>
                MyloNex
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
              <div className="mb-8">
                <p className="mb-2 text-sm font-medium text-zinc-500">
                  Welcome back
                </p>

                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  Access your workspace
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Choose your workspace to get started.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/login?role=buyer"
                  className="group flex w-full items-center justify-between rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-900 hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100">
                      <Building2 className="h-5 w-5 text-zinc-700" />
                    </div>

                    <div>
                      <p className="font-medium text-zinc-900">
                        Continue as Buyer
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-500">
                        Browse fabrics & submit RFQs
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="h-5 w-5 text-zinc-400 transition group-hover:translate-x-1 group-hover:text-zinc-900" />
                </Link>

                <Link
                  href="/login?role=supplier"
                  className="group flex w-full items-center justify-between rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-900 hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100">
                      <ShieldCheck className="h-5 w-5 text-zinc-700" />
                    </div>

                    <div>
                      <p className="font-medium text-zinc-900">
                        Continue as Supplier
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-500">
                        Manage inquiries & quotations
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="h-5 w-5 text-zinc-400 transition group-hover:translate-x-1 group-hover:text-zinc-900" />
                </Link>
              </div>

              <div className="mt-8 border-t border-zinc-100 pt-6">
                <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Demo environment
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}