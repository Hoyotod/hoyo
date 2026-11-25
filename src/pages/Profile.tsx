import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, extractErrorMessage } from "../lib/api";
import { signOut } from "../lib/auth-client";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
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
  const [telegramChatId, setTelegramChatId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.me()
      .then((d) => {
        setName(d.user.name ?? "");
        setEmail(d.user.email);
        setInitialEmail(d.user.email);
        setWebhook(d.user.webhook ?? "");
        setTelegramChatId(d.user.telegramChatId ?? "");
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
        telegramChatId: telegramChatId.trim() ? telegramChatId.trim() : null,
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
        <div>
          <Label htmlFor="telegramChatId">Telegram Chat ID (optional)</Label>
          <Input id="telegramChatId" maxLength={64} value={telegramChatId} onChange={(e) => setTelegramChatId(e.target.value)} placeholder="e.g. 123456789 or @channel" />
        </div>
        <Button disabled={saving} type="submit" className="w-full">
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </form>
      </Card>

      {/* Danger zone */}
      <Card className="mt-6 p-6 sm:p-8 border-2 border-red-500">
        <h2 className="text-xl uppercase text-red-600 font-bold">Danger Zone</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Once you delete your account, there is no going back. All your game accounts and data will be permanently deleted.
        </p>
        <Button
          variant="neutral"
          className="mt-4 border-2 border-red-500 text-red-600 hover:bg-red-50"
          onClick={() => setShowDeleteDialog(true)}
        >
          Delete My Account
        </Button>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account, all your game accounts, and any associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="deletePassword">Enter your password to confirm</Label>
            <Input
              id="deletePassword"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Your current password"
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDeletePassword(""); setShowDeleteDialog(false); }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={async () => {
                if (!deletePassword.trim()) return;
                setDeleting(true);
                try {
                  await api.deleteMe(deletePassword);
                  await signOut().catch(() => {});
                  navigate("/");
                } catch (err) {
                  setError(extractErrorMessage(err));
                  setShowDeleteDialog(false);
                } finally {
                  setDeleting(false);
                  setDeletePassword("");
                }
              }}
              disabled={deleting || !deletePassword.trim()}
            >
              {deleting ? "Deleting…" : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
