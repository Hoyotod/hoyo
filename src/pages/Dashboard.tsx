import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, extractErrorMessage, type GameAccount } from "../lib/api";
import Modal from "../components/Modal";

type Mode = { kind: "create" } | { kind: "edit"; account: GameAccount } | { kind: "token"; account: GameAccount } | null;

export default function Dashboard() {
  const [accounts, setAccounts] = useState<GameAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.accounts();
      setAccounts(data.accounts);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function onDelete(id: string) {
    if (!confirm("Delete this account? This cannot be undone.")) return;
    try {
      await api.deleteAccount(id);
      await load();
    } catch (e) {
      setError(extractErrorMessage(e));
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="neo-badge bg-black dark:bg-white text-[#FFD02F] dark:text-black">Dashboard</p>
          <h1 className="mt-2 font-display text-3xl sm:text-5xl uppercase">Your Accounts</h1>
        </div>
        <button onClick={() => setMode({ kind: "create" })} className="neo-btn bg-[#FFD02F] dark:bg-neutral-800">+ Add Account</button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Your Accounts" value={String(accounts.length)} accent="bg-[#FFD02F]" />
        <Stat label="Total Stored" value={String(accounts.length)} accent="bg-[#00D68F]" />
        <Stat label="Security" value="ENCRYPTED" accent="bg-[#5BA4FF]" />
      </div>

      {error && (
        <div className="mt-6 border-3 border-black dark:border-neutral-100 bg-[#FF5C5C] text-white px-4 py-3 font-mono font-bold">
          {error}
        </div>
      )}

      <div className="neo-card mt-6 overflow-auto">
        {loading ? (
          <p className="p-8 text-center font-mono font-bold uppercase">Loading…</p>
        ) : accounts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-display text-2xl uppercase">No accounts yet</p>
            <p className="mt-2 font-mono text-sm">Add your first game account to get started.</p>
            <button onClick={() => setMode({ kind: "create" })} className="neo-btn mt-4 bg-black dark:bg-white text-[#FFD02F] dark:text-black">+ Add Account</button>
          </div>
        ) : (
          <table className="neo-table min-w-[640px]">
            <thead>
              <tr>
                <th>Name</th>
                <th>Account ID</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className="bg-white dark:bg-neutral-900">
                  <td className="font-bold">{a.name}</td>
                  <td>{a.accountId}</td>
                  <td className="text-xs">{new Date(a.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setMode({ kind: "token", account: a })} className="neo-btn bg-[#5BA4FF] text-white text-xs">Token</button>
                      <button onClick={() => setMode({ kind: "edit", account: a })} className="neo-btn bg-white dark:bg-neutral-800 text-xs">Edit</button>
                      <button onClick={() => onDelete(a.id)} className="neo-btn bg-[#FF5C5C] text-white text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {mode?.kind === "create" && (
        <AccountForm
          title="Add Account"
          onClose={() => setMode(null)}
          onSaved={() => { setMode(null); load(); }}
        />
      )}
      {mode?.kind === "edit" && (
        <AccountForm
          title="Edit Account"
          account={mode.account}
          onClose={() => setMode(null)}
          onSaved={() => { setMode(null); load(); }}
        />
      )}
      {mode?.kind === "token" && (
        <TokenModal account={mode.account} onClose={() => setMode(null)} />
      )}
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="neo-card p-4">
      <span className={`inline-block h-3 w-8 border-2 border-black dark:border-neutral-100 ${accent} mb-2`} />
      <p className="font-mono text-xs uppercase">{label}</p>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
}

function AccountForm({
  title,
  account,
  onClose,
  onSaved,
}: {
  title: string;
  account?: GameAccount;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(account?.name ?? "");
  const [accountId, setAccountId] = useState(account?.accountId ?? "");
  const [cookieToken, setCookieToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (account) {
        const body: { name: string; accountId: string; cookieToken?: string } = { name, accountId };
        if (cookieToken.trim()) body.cookieToken = cookieToken;
        await api.updateAccount(account.id, body);
      } else {
        await api.createAccount({ name, accountId, cookieToken });
      }
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <div className="border-3 border-black bg-[#FF5C5C] text-white px-3 py-2 font-mono text-sm font-bold">{error}</div>}
        <div>
          <label className="neo-label" htmlFor="name">Name</label>
          <input id="name" required minLength={1} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className="neo-input" placeholder="Genshin Account" />
        </div>
        <div>
          <label className="neo-label" htmlFor="accountId">Account ID</label>
          <input id="accountId" required minLength={1} maxLength={255} value={accountId} onChange={(e) => setAccountId(e.target.value)} className="neo-input" placeholder="123456789" />
        </div>
        <div>
          <label className="neo-label" htmlFor="cookieToken">{account ? "New Cookie Token (optional)" : "Cookie Token"}</label>
          <textarea id="cookieToken" required={!account} minLength={1} maxLength={2048} value={cookieToken} onChange={(e) => setCookieToken(e.target.value)} className="neo-input min-h-[100px]" placeholder={account ? "Leave blank to keep existing" : "ltoken=...; ltuid=..."} />
          {account && <p className="mt-1 font-mono text-xs">Leave blank to keep existing token.</p>}
        </div>
        <div className="flex gap-3 pt-2">
          <button disabled={busy} type="submit" className="neo-btn flex-1 bg-black dark:bg-white text-[#FFD02F] dark:text-black">{busy ? "…" : "Save"}</button>
          <button type="button" onClick={onClose} className="neo-btn bg-white dark:bg-neutral-800">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

function TokenModal({ account, onClose }: { account: GameAccount; onClose: () => void }) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getToken(account.id)
      .then((d) => setToken(d.cookieToken))
      .catch((e) => setError(extractErrorMessage(e)));
  }, [account.id]);

  async function copy() {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Modal title="Cookie Token" onClose={onClose}>
      <p className="font-mono text-xs uppercase mb-2">{account.name} · {account.accountId}</p>
      {error && <div className="border-3 border-black bg-[#FF5C5C] text-white px-3 py-2 font-mono text-sm font-bold">{error}</div>}
      {token ? (
        <>
          <div className="border-3 border-black dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800 p-3 font-mono text-xs break-all max-h-40 overflow-auto">{token}</div>
          <button onClick={copy} className="neo-btn mt-4 w-full bg-[#00D68F] text-black">{copied ? "Copied ✓" : "Copy Token"}</button>
          <p className="mt-3 font-mono text-xs">⚠ Sensitive — do not share. Close this modal to hide.</p>
        </>
      ) : !error ? (
        <p className="font-mono font-bold uppercase">Loading…</p>
      ) : null}
    </Modal>
  );
}
