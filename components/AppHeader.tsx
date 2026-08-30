"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

type AppHeaderProps = {
  role: "BUYER" | "SUPPLIER";
};

export default function AppHeader({ role }: AppHeaderProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isBuyer = role === "BUYER";

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href={user ? (isBuyer ? "/buyer/catalog" : "/supplier/inquiries") : "/"}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#171717] text-lg font-semibold text-white">
            M
          </div>

          <span className="text-xl font-semibold text-[#171717]">
            MyloNex
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-3 sm:gap-6">
          {!loading && user && (
            <>
              {isBuyer ? (
                <>
                  <Link
                    href="/buyer/inquiries"
                    className="text-sm font-medium text-[#171717] hover:text-black"
                  >
                    My Inquiries
                  </Link>

                  <Link
                    href="/buyer/catalog"
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#171717] hover:bg-gray-50"
                  >
                    Browse Fabrics
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/supplier/inquiries"
                    className="text-sm font-medium text-[#171717] hover:text-black"
                  >
                    Inquiries
                  </Link>

                  <Link
                    href="/supplier/quotes"
                    className="text-sm font-medium text-[#171717] hover:text-black"
                  >
                    Quotes
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}

          {!loading && !user && (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a2a2a]"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}