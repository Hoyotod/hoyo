"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { registerSchema, fieldErrors } from "@/lib/validation";
import { FieldError } from "../FieldError";
import { registerUser } from "./actions";

export default function RegisterPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData);
    const parsed = fieldErrors(registerSchema, data);

    if (!parsed.success) {
      setErrors(parsed.errors);
      setError(null);
      return;
    }

    setErrors({});
    setError(null);
    setPending(true);
    try {
      const registered = await registerUser(formData);
      if (!registered.success) {
        setError(registered.error ?? "Registration failed");
        return;
      }

      const signInResult = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Failed to sign in after registration");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#E0F7FA] flex items-center justify-center p-8 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-900 dark:border-gray-600">
          <h2 className="text-3xl font-extrabold text-black mb-8 font-mono text-center dark:text-white">
            REGISTER
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-bold mb-2 font-mono text-black dark:text-gray-200"
              >
                NAME
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full px-4 py-3 border-4 border-black font-mono text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-500"
                placeholder="Your name"
              />
              <FieldError message={errors.name} />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold mb-2 font-mono text-black dark:text-gray-200"
              >
                EMAIL
              </label>
              <input
                id="email"
                name="email"
                type="text"
                className="w-full px-4 py-3 border-4 border-black font-mono text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-500"
                placeholder="you@example.com"
              />
              <FieldError message={errors.email} />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold mb-2 font-mono text-black dark:text-gray-200"
              >
                PASSWORD
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="w-full px-4 py-3 border-4 border-black font-mono text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-500"
                placeholder="••••••••"
              />
              <FieldError message={errors.password} />
            </div>

            {error && (
              <div className="bg-[#FF6B6B] border-4 border-black p-3 text-center font-mono text-sm text-black dark:border-gray-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 bg-[#4ECDC4] text-black border-4 border-black px-4 py-4 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:border-gray-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
            >
              {pending && <Loader2 size={16} className="animate-spin" />}
              {pending ? "REGISTERING…" : "REGISTER"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-black font-bold font-mono hover:underline dark:text-gray-200"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
