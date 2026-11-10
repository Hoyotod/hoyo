import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { api, extractErrorMessage, type GameAccount } from "../lib/api";
import AccountDataTable from "../components/AccountDataTable";
import Modal from "../components/Modal";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardDescription, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Spinner } from "../components/ui/spinner";
import { Textarea } from "../components/ui/textarea";
import { toast } from "../components/ui/toast";

type Mode = { kind: "create" } | { kind: "edit"; account: GameAccount } | { kind: "token"; account: GameAccount } | null;

export default function Dashboard() {
  const [accounts, setAccounts] = useState<GameAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>(null);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<GameAccount | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) => a.name.toLowerCase().includes(q) || a.accountId.toLowerCase().includes(q),
    );
  }, [accounts, query]);

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
    try {
      await api.deleteAccount(id);
      await load();
      toast.add({ title: "Account deleted", type: "success" });
    } catch (e) {
      setError(extractErrorMessage(e));
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge>Dashboard</Badge>
          <h1 className="mt-2 text-3xl sm:text-5xl uppercase">Your Accounts</h1>
        </div>
        <Button onClick={() => setMode({ kind: "create" })}>+ Add Account</Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mt-6 overflow-auto p-0">
        {loading ? (
          <p className="p-8 text-center font-bold uppercase flex items-center justify-center gap-2"><Spinner /> Loading…</p>
        ) : accounts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-2xl uppercase">No accounts yet</p>
            <p className="mt-2 text-sm">Add your first game account to get started.</p>
            <Button onClick={() => setMode({ kind: "create" })} className="mt-4">+ Add Account</Button>
          </div>
        ) : (
          <AccountDataTable
            data={filtered}
            query={query}
            onQueryChange={setQuery}
            onToken={(a) => setMode({ kind: "token", account: a })}
            onEdit={(a) => setMode({ kind: "edit", account: a })}
            onDeleteRequest={(a) => setDeleteTarget(a)}
          />
        )}
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete {deleteTarget?.name} ({deleteTarget?.accountId})? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-black text-white hover:bg-black"
              onClick={() => { if (deleteTarget) onDelete(deleteTarget.id); setDeleteTarget(null); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
        toast.add({ title: "Account updated", type: "success" });
      } else {
        await api.createAccount({ name, accountId, cookieToken });
        toast.add({ title: "Account created", type: "success" });
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
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" required minLength={1} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder="Genshin Account" />
        </div>
        <div>
          <Label htmlFor="accountId">Account ID</Label>
          <Input id="accountId" required minLength={1} maxLength={255} value={accountId} onChange={(e) => setAccountId(e.target.value)} placeholder="123456789" />
        </div>
        <div>
          <Label htmlFor="cookieToken">{account ? "New Cookie Token (optional)" : "Cookie Token"}</Label>
          <Textarea id="cookieToken" required={!account} minLength={1} maxLength={2048} value={cookieToken} onChange={(e) => setCookieToken(e.target.value)} className="min-h-[100px]" placeholder={account ? "Leave blank to keep existing" : "v2_CAQSDGRlOG9..."} />
          <p className="mt-1 text-xs">
            Paste only the <code>cookie_token_v2</code> value (a single string starting with <code>v2_</code>), not the whole cookie like <code>ltoken=...; ltuid=...</code>.
          </p>
          {account && <p className="mt-1 text-xs">Leave blank to keep existing token.</p>}
        </div>
        <div className="flex gap-3 pt-2">
          <Button disabled={busy} type="submit" variant="noShadow" className="flex-1">{busy ? "…" : "Save"}</Button>
          <Button type="button" variant="noShadow" className="bg-secondary-background text-foreground" onClick={onClose}>Cancel</Button>
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
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(token);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      try {
        const ta = document.createElement("textarea");
        ta.value = token;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, token.length);
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      toast.add({ title: "Copied to clipboard", type: "success" });
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.add({
        title: "Copy failed",
        description: "Select the token above and copy manually.",
        type: "error",
      });
    }
  }

  return (
    <Modal title="Cookie Token" onClose={onClose}>
      <p className="text-xs uppercase mb-2">{account.name} · {account.accountId}</p>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {token ? (
        <>
          <div className="border-2 border-border bg-secondary-background p-3 text-xs break-all max-h-40 overflow-auto">{token}</div>
          <Button onClick={copy} variant="noShadow" className="mt-4 w-full">{copied ? "Copied ✓" : "Copy Token"}</Button>
          <p className="mt-3 text-xs">⚠ Sensitive — do not share. Close this modal to hide.</p>
        </>
      ) : !error ? (
        <p className="font-bold uppercase flex items-center gap-2"><Spinner /> Loading…</p>
      ) : null}
    </Modal>
  );
}
