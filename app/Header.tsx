"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { data: session } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="w-full bg-[#FFE4E6] border-b-4 border-black py-4 px-8 dark:bg-gray-900 dark:border-gray-600">
      <nav className="flex justify-between items-center max-w-6xl mx-auto">
        <Link
          href="/"
          className="text-xl font-extrabold text-black font-mono hover:underline dark:text-white"
        >
          HOYOACCOUNT
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="bg-[#4ECDC4] text-black border-4 border-black px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:border-gray-600"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="bg-white text-black border-4 border-black px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:bg-gray-800 dark:text-white dark:border-gray-600"
              >
                Profile
              </Link>
              <div className="text-sm font-mono">
                <div className="text-black dark:text-white">
                  {session.user?.name}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {session.user?.email}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center gap-2 bg-[#FF6B6B] text-black border-4 border-black px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:border-gray-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
              >
                {signingOut && <Loader2 size={16} className="animate-spin" />}
                {signingOut ? "Signing Out…" : "Sign Out"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-[#FF6B6B] text-black border-4 border-black px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:border-gray-600"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-[#4ECDC4] text-black border-4 border-black px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:border-gray-600"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
