"use client";

import { Eye, Pencil, Trash2, X, Copy, Check, Loader2 } from "lucide-react";
import { startTransition, useState } from "react";
import { updateAccount, deleteAccount, getCookieToken } from "./actions";
import { accountSchema, updateAccountSchema, fieldErrors } from "@/lib/validation";
import { FieldError } from "../FieldError";

type Account = {
  id: string;
  name: string;
  accountId: string;
};

type ModalState = "show" | "edit" | "delete" | null;

const buttonClass =
  "p-2 text-black border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all dark:border-gray-600";

const overlayClass =
  "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4";

const panelClass =
  "w-full max-w-md bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-900 dark:border-gray-600 relative";

const inputClass =
  "w-full px-4 py-3 border-4 border-black font-mono text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-500";

const labelClass =
  "block text-sm font-bold mb-2 font-mono text-black dark:text-gray-200";

export default function AccountActions({ account }: { account: Account }) {
  const [modal, setModal] = useState<ModalState>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [name, setName] = useState(account.name);
  const [accountId, setAccountId] = useState(account.accountId);
  const [cookieToken, setCookieToken] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editPending, setEditPending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function close() {
    setModal(null);
    setCopied(null);
    setName(account.name);
    setAccountId(account.accountId);
    setCookieToken("");
    setToken(null);
    setLoading(false);
    setEditPending(false);
    setDeletePending(false);
    setErrors({});
    setSubmitError(null);
  }

  function setModalState(next: ModalState) {
    setErrors({});
    setSubmitError(null);
    setEditPending(false);
    setDeletePending(false);
    if (next === "edit") {
      setCookieToken("");
    }
    if (next === "show") {
      setToken(null);
      setLoading(true);
      const formData = new FormData();
      formData.set("id", account.id);
      startTransition(async () => {
        const value = await getCookieToken(formData);
        setToken(value);
        setLoading(false);
      });
    }
    setModal(next);
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  function handleEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editPending) return;
    const values = { name, accountId, cookieToken };
    const parsed = fieldErrors(updateAccountSchema, values);

    if (!parsed.success) {
      setErrors(parsed.errors);
      setSubmitError(null);
      return;
    }

    setErrors({});
    setSubmitError(null);
    const formData = new FormData();
    formData.set("id", account.id);
    formData.set("name", name);
    formData.set("accountId", accountId);
    formData.set("cookieToken", cookieToken);
    setEditPending(true);
    startTransition(async () => {
      try {
        const success = await updateAccount(formData);
        if (success) {
          close();
        } else {
          setSubmitError(
            "Failed to update account. Check details or use a unique Account ID."
          );
        }
      } finally {
        setEditPending(false);
      }
    });
  }

  function handleDelete() {
    if (deletePending) return;
    const formData = new FormData();
    formData.set("id", account.id);
    setDeletePending(true);
    startTransition(async () => {
      try {
        const success = await deleteAccount(formData);
        if (success) {
          close();
        }
      } finally {
        setDeletePending(false);
      }
    });
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setModalState("show")}
          aria-label="Show account"
          className={`${buttonClass} bg-[#FFE66D]`}
        >
          <Eye size={16} />
        </button>
        <button
          type="button"
          onClick={() => setModalState("edit")}
          aria-label="Edit account"
          className={`${buttonClass} bg-[#4ECDC4]`}
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          onClick={() => setModalState("delete")}
          aria-label="Delete account"
          className={`${buttonClass} bg-[#FF6B6B]`}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {modal && (
        <div className={overlayClass} onClick={editPending || deletePending ? undefined : close}>
          <div
            role="dialog"
            aria-modal="true"
            className={panelClass}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              disabled={editPending || deletePending}
              aria-label="Close"
              className="absolute top-3 right-3 p-1 text-black dark:text-white hover:opacity-70 disabled:opacity-40"
            >
              <X size={24} />
            </button>

            {modal === "show" && (
              <>
                <h2 className="text-2xl font-extrabold mb-6 font-mono text-black dark:text-white">
                  ACCOUNT DETAILS
                </h2>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className={labelClass}>ACCOUNT ID</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 border-4 border-black font-mono text-sm text-black bg-gray-50 break-all dark:bg-gray-800 dark:text-white dark:border-gray-600">
                        {account.accountId}
                      </div>
                      <button
                        type="button"
                        onClick={() => copy(account.accountId, "accountId")}
                        className="bg-[#4ECDC4] text-black border-4 border-black p-3 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all dark:border-gray-600"
                        aria-label="Copy account ID"
                      >
                        {copied === "accountId" ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>COOKIE TOKEN</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 border-4 border-black font-mono text-sm text-black bg-gray-50 break-all flex items-center gap-2 dark:bg-gray-800 dark:text-white dark:border-gray-600">
                        {loading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Loading…
                          </>
                        ) : (
                          token ?? "Not found"
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => token && copy(token, "cookieToken")}
                        disabled={loading || !token}
                        className="bg-[#4ECDC4] text-black border-4 border-black p-3 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all dark:border-gray-600 disabled:opacity-50"
                        aria-label="Copy cookie token"
                      >
                        {copied === "cookieToken" ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={close}
                  disabled={loading}
                  className="w-full bg-[#FF6B6B] text-black border-4 border-black px-4 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:border-gray-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
                >
                  CLOSE
                </button>
              </>
            )}

            {modal === "edit" && (
              <>
                <h2 className="text-2xl font-extrabold mb-6 font-mono text-black dark:text-white">
                  EDIT ACCOUNT
                </h2>
                <form onSubmit={handleEdit} className="space-y-5">
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
                    <label htmlFor="accountId" className={labelClass}>
                      ACCOUNT ID
                    </label>
                    <input
                      id="accountId"
                      type="text"
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className={inputClass}
                    />
                    <FieldError message={errors.accountId} />
                  </div>
                  <div>
                    <label htmlFor="cookieToken" className={labelClass}>
                      COOKIE TOKEN
                    </label>
                    <input
                      id="cookieToken"
                      type="text"
                      value={cookieToken}
                      onChange={(e) => setCookieToken(e.target.value)}
                      className={inputClass}
                      placeholder="Leave blank to keep current token"
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
                      disabled={editPending}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#4ECDC4] text-black border-4 border-black px-4 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:border-gray-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
                    >
                      {editPending && <Loader2 size={16} className="animate-spin" />}
                      {editPending ? "SAVING…" : "SAVE"}
                    </button>
                    <button
                      type="button"
                      onClick={close}
                      disabled={editPending}
                      className="flex-1 bg-[#FF6B6B] text-black border-4 border-black px-4 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:border-gray-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              </>
            )}

            {modal === "delete" && (
              <>
                <h2 className="text-2xl font-extrabold mb-4 font-mono text-black dark:text-white">
                  DELETE ACCOUNT?
                </h2>
                <p className="font-mono text-black mb-6 dark:text-gray-200">
                  Are you sure you want to delete{" "}
                  <span className="font-extrabold">{account.name}</span>? This
                  action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deletePending}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#FF6B6B] text-black border-4 border-black px-4 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:border-gray-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
                  >
                    {deletePending && <Loader2 size={16} className="animate-spin" />}
                    {deletePending ? "DELETING…" : "DELETE"}
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    disabled={deletePending}
                    className="flex-1 bg-[#95E1D3] text-black border-4 border-black px-4 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:border-gray-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
                  >
                    CANCEL
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
