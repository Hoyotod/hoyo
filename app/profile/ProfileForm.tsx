"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { Loader2 } from "lucide-react";
import { updateProfile } from "./actions";
import { updateProfileSchema, fieldErrors } from "@/lib/validation";
import { FieldError } from "../FieldError";

type Props = {
  initialName: string | null;
  initialEmail: string;
  initialWebhook?: string | null;
};

const inputClass =
  "w-full px-4 py-3 border-4 border-black font-mono text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-500";

const labelClass =
  "block text-sm font-bold mb-2 font-mono text-black dark:text-gray-200";

export default function ProfileForm({
  initialName,
  initialEmail,
  initialWebhook,
}: Props) {
  const { update } = useSession();
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [webhook, setWebhook] = useState(initialWebhook ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const values = { name, email, password, webhook };
    const parsed = fieldErrors(updateProfileSchema, values);

    if (!parsed.success) {
      setErrors(parsed.errors);
      setError(null);
      return;
    }

    setErrors({});
    setError(null);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("email", email);
    if (password.length > 0) {
      formData.set("password", password);
    }
    formData.set("webhook", webhook);
    setPending(true);
    startTransition(async () => {
      try {
        const result = await updateProfile(formData);
        if (!result.success) {
          setError("Failed to update profile. Check your details or use a unique email.");
          return;
        }
        if (result.passwordChanged) {
          setError(null);
          await signOut({ redirect: false });
          router.push("/login?changed=1");
          router.refresh();
          return;
        }
        setPassword("");
        if (result.user) {
          await update({ name: result.user.name, email: result.user.email });
        }
      } finally {
        setPending(false);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className={labelClass}>
          NAME
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <FieldError message={errors.name} />
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>
          EMAIL
        </label>
        <input
          id="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <FieldError message={errors.email} />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          NEW PASSWORD
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave blank to keep current"
          className={inputClass}
        />
        <FieldError message={errors.password} />
      </div>
      <div>
        <label htmlFor="webhook" className={labelClass}>
          WEBHOOK URL
        </label>
        <input
          id="webhook"
          type="text"
          value={webhook}
          onChange={(e) => setWebhook(e.target.value)}
          placeholder="https://discord.com/api/webhooks/... (optional)"
          className={inputClass}
        />
        <FieldError message={errors.webhook} />
      </div>

      {error && (
        <div className="bg-[#FF6B6B] border-4 border-black p-3 text-center font-mono text-sm text-black dark:border-gray-600">
          {error}
        </div>
      )}

      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 flex items-center justify-center gap-2 bg-[#4ECDC4] text-black border-4 border-black px-4 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:border-gray-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
        >
          {pending && <Loader2 size={16} className="animate-spin" />}
          {pending ? "SAVING…" : "SAVE"}
        </button>
        <Link
          href="/dashboard"
          aria-disabled={pending}
          onClick={(e) => { if (pending) e.preventDefault(); }}
          className="flex-1 text-center bg-[#95E1D3] text-black border-4 border-black px-4 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:border-gray-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
        >
          BACK
        </Link>
      </div>
    </form>
  );
}
