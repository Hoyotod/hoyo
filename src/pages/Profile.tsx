import { useEffect, useState, type FormEvent } from "react";
import { api, extractErrorMessage } from "../lib/api";

export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [webhook, setWebhook] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.me()
      .then((d) => {
        setName(d.user.name ?? "");
        setEmail(d.user.email);
        setWebhook(d.user.webhook ?? "");
      })
      .catch((e) => setError(extractErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const result = await api.updateMe({
        name,
        email: email.toLowerCase().trim(),
        password: password || undefined,
        webhook: webhook.trim() ? webhook.trim() : null,
      });
      setPassword("");
      setSuccess(result.passwordChanged ? "Profile updated. Password changed — other sessions invalidated." : "Profile updated.");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="mx-auto max-w-xl px-4 py-12"><p className="neo-card p-6 font-mono font-bold uppercase text-center">Loading…</p></main>;

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <p className="neo-badge bg-black dark:bg-white text-[#FFD02F] dark:text-black">Profile</p>
      <h1 className="mt-2 font-display text-4xl uppercase">Your Info</h1>

      <form onSubmit={onSubmit} className="neo-card mt-6 p-6 sm:p-8 space-y-4">
        {error && <div className="border-3 border-black bg-[#FF5C5C] text-white px-3 py-2 font-mono text-sm font-bold">{error}</div>}
        {success && <div className="border-3 border-black dark:border-neutral-100 bg-[#00D68F] text-black px-3 py-2 font-mono text-sm font-bold">{success}</div>}

        <div>
          <label className="neo-label" htmlFor="name">Name</label>
          <input id="name" required minLength={1} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className="neo-input" />
        </div>
        <div>
          <label className="neo-label" htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="neo-input" />
        </div>
        <div>
          <label className="neo-label" htmlFor="password">New Password (leave blank to keep)</label>
          <input id="password" type="password" minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} className="neo-input" placeholder="Min 8 chars" />
        </div>
        <div>
          <label className="neo-label" htmlFor="webhook">Discord Webhook URL (optional)</label>
          <input id="webhook" type="url" maxLength={2048} value={webhook} onChange={(e) => setWebhook(e.target.value)} className="neo-input" placeholder="https://discord.com/api/webhooks/..." />
        </div>
        <button disabled={saving} type="submit" className="neo-btn w-full bg-black dark:bg-white text-[#FFD02F] dark:text-black">
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </main>
  );
}
