"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedRole = searchParams.get("role");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const role =
    selectedRole === "supplier" || selectedRole === "buyer"
      ? selectedRole
      : null;

  const roleLabel = role === "supplier" ? "Supplier" : "Buyer";

  useEffect(() => {
    setError("");
  }, [selectedRole]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Unable to sign in.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("PROFILE ERROR:", profileError);
      setError("Unable to determine your account role.");
      setLoading(false);
      return;
    }

    const actualRole = profile.role?.toLowerCase();

    // Check whether the account matches the workspace selected
    // on the previous page.
    if (role && actualRole !== role) {
      await supabase.auth.signOut();

      setError(
        `This account is registered as a ${
          actualRole === "supplier" ? "Supplier" : "Buyer"
        }. Please select the ${
          actualRole === "supplier" ? "Supplier" : "Buyer"
        } workspace to continue.`
      );

      setLoading(false);
      return;
    }

    if (profile.role === "SUPPLIER") {
      router.push("/supplier/inquiries");
      return;
    }

    if (profile.role === "BUYER") {
      router.push("/buyer/catalog");
      return;
    }

    await supabase.auth.signOut();

    setError("Invalid account role.");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white">
                M
              </div>

              <span className="text-lg font-semibold text-zinc-900">
                MyloNex
              </span>
            </Link>

            <h1 className="mt-8 text-2xl font-semibold tracking-tight text-zinc-900">
              {role ? `Sign in as ${roleLabel}` : "Welcome back"}
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              {role
                ? `Sign in to access your ${roleLabel.toLowerCase()} workspace.`
                : "Sign in to manage your fabric inquiries."}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-900"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-900"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-zinc-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-900 hover:underline"
            >
              ← Back to workspace selection
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-zinc-50 px-6 py-12">
          <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
            <div className="w-full rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-zinc-500">Loading...</p>
            </div>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}