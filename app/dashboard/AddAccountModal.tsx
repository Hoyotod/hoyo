"use client";

import { X, Loader2 } from "lucide-react";
import { startTransition, useState } from "react";
import { addAccount } from "./actions";
import { accountSchema, fieldErrors } from "@/lib/validation";
import { FieldError } from "../FieldError";

export default function AddAccountModal() {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    const parsed = fieldErrors(accountSchema, Object.fromEntries(formData));

    if (!parsed.success) {
      setErrors(parsed.errors);
      setSubmitError(null);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setPending(true);
    startTransition(async () => {
      try {
        const success = await addAccount(formData);
        if (success) {
          setOpen(false);
        } else {
          setSubmitError(
            "Failed to add account. Check details or use a unique Account ID."
          );
        }
      } finally {
        setPending(false);
      }
    });
  }

  function openModal() {
    setErrors({});
    setSubmitError(null);
    setPending(false);
    setOpen(true);
  }

  function closeModal() {
    setErrors({});
    setSubmitError(null);
    setPending(false);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="bg-[#4ECDC4] text-black border-4 border-black px-6 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:border-gray-600"
      >
        ADD ACCOUNT
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={pending ? undefined : closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Add account"
            className="w-full max-w-md bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-900 dark:border-gray-600 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              disabled={pending}
              aria-label="Close"
              className="absolute top-3 right-3 p-1 text-black dark:text-white hover:opacity-70 disabled:opacity-40"
            >
              <X size={24} />
            </button>

        <h2 className="text-2xl font-extrabold mb-6 font-mono text-black dark:text-white">
          ADD ACCOUNT
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="Account name"
            />
            <FieldError message={errors.name} />
          </div>
          <div>
            <label
              htmlFor="accountId"
              className="block text-sm font-bold mb-2 font-mono text-black dark:text-gray-200"
            >
              ACCOUNT ID
            </label>
            <input
              id="accountId"
              name="accountId"
              type="text"
              className="w-full px-4 py-3 border-4 border-black font-mono text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-500"
              placeholder="Game account ID"
            />
            <FieldError message={errors.accountId} />
          </div>
          <div>
            <label
              htmlFor="cookieToken"
              className="block text-sm font-bold mb-2 font-mono text-black dark:text-gray-200"
            >
              COOKIE TOKEN
            </label>
            <input
              id="cookieToken"
              name="cookieToken"
              type="text"
              className="w-full px-4 py-3 border-4 border-black font-mono text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-500"
              placeholder="Cookie token"
            />
            <FieldError message={errors.cookieToken} />
          </div>

          {submitError && (
            <div className="bg-[#FF6B6B] border-4 border-black p-3 text-center font-mono text-sm text-black dark:border-gray-600">
              {submitError}
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
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={pending}
                  className="flex-1 bg-[#FF6B6B] text-black border-4 border-black px-4 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:border-gray-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
