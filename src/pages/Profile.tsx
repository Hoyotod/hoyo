import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, extractErrorMessage } from "../lib/api";
import { signOut } from "../lib/auth-client";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Spinner } from "../components/ui/spinner";

export default function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initialEmail, setInitialEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
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
        setInitialEmail(d.user.email);
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
      const emailChanged = email.toLowerCase().trim() !== initialEmail.toLowerCase();
      const result = await api.updateMe({
        name: name.trim() ? name.trim() : undefined,
        email: emailChanged ? email.toLowerCase().trim() : undefined,
        password: password || undefined,
        currentPassword: currentPassword || undefined,
        webhook: webhook.trim() ? webhook.trim() : null,
      });
      setPassword("");
      setCurrentPassword("");
      if (result.reloginRequired) {
        await signOut().catch(() => {});
        navigate("/login");
        return;
      }
      if (emailChanged) {
        setSuccess("Profile updated. Email changed.");
        setInitialEmail(email.toLowerCase().trim());
      } else if (result.passwordChanged) {
        setSuccess("Profile updated. Password changed — other sessions invalidated.");
      } else {
        setSuccess("Profile updated.");
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <Card className="p-6 font-bold uppercase text-center flex items-center justify-center gap-2">
        <Spinner /> Loading…
      </Card>
    </main>
  );

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <Badge>Profile</Badge>
      <h1 className="mt-2 text-4xl uppercase">Your Info</h1>

      <Card className="mt-6 p-6 sm:p-8">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {success && <Alert><AlertDescription>{success}</AlertDescription></Alert>}

        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" required minLength={1} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">New Password (leave blank to keep)</Label>
          <Input id="password" type="password" minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 chars" />
        </div>
        <div>
          <Label htmlFor="currentPassword">Current Password (required to change email/password)</Label>
          <Input id="currentPassword" type="password" maxLength={128} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Required when changing email or password" />
        </div>
        <div>
          <Label htmlFor="webhook">Discord Webhook URL (optional)</Label>
          <Input id="webhook" type="url" maxLength={2048} value={webhook} onChange={(e) => setWebhook(e.target.value)} placeholder="https://discord.com/api/webhooks/..." />
        </div>
        <Button disabled={saving} type="submit" className="w-full">
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </form>
      </Card>
    </main>
  );
}
