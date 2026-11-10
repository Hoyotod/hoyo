import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSessionUser } from "../lib/auth-client";
import { api } from "../lib/api";
import { Badge } from "../components/ui/badge";
import { Card, CardDescription, CardTitle } from "../components/ui/card";
import { buttonVariants } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";

export default function Landing() {
  const { user } = useSessionUser();
  const [stats, setStats] = useState<{ totalUsers: number; totalGameAccounts: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    api.stats().then(setStats).catch(() => setStats(null)).finally(() => setStatsLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      <Card className="p-6 sm:p-10">
        <Badge className="mb-4">Game Accounts</Badge>
        <h1 className="text-4xl sm:text-6xl uppercase leading-[1.05]">
          Manage all your HoYo accounts. <span className="inline-block bg-black text-white px-2 py-0.5 mt-1">One place.</span>
        </h1>
        <CardDescription className="mt-4 max-w-xl text-base sm:text-lg">
          Store, view, edit and delete your Hoyoverse game accounts. Cookie tokens stay server-side until you need them.
        </CardDescription>
        <div className="mt-8 flex flex-wrap gap-3">
          {user ? (
            <Link to="/dashboard" className={buttonVariants({ variant: "default" })}>→ Dashboard</Link>
          ) : (
            <>
              <Link to="/register" className={buttonVariants({ variant: "default" })}>Get Started</Link>
              <Link to="/login" className={buttonVariants({ variant: "neutral" })}>Login</Link>
            </>
          )}
        </div>
      </Card>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {[
          { title: "Secure", body: "Tokens never leak in lists. Fetch on-demand only." },
          { title: "Fast", body: "Cloudflare edge + D1. Auth + API on same network." },
          { title: "Yours", body: "CRUD as many accounts as you own. No limits." },
        ].map((c) => (
          <Card key={c.title} className="p-5">
            <span className="inline-block h-4 w-10 border-2 border-border bg-main mb-3" />
            <CardTitle className="text-xl uppercase">{c.title}</CardTitle>
            <CardDescription className="mt-1">{c.body}</CardDescription>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <span className="inline-block h-4 w-10 border-2 border-border bg-main mb-3" />
          <CardDescription className="text-xs uppercase">Total User</CardDescription>
          <CardTitle className="text-3xl">
            {stats ? String(stats.totalUsers) : statsLoading ? <Spinner className="size-6" /> : "—"}
          </CardTitle>
        </Card>
        <Card className="p-5">
          <span className="inline-block h-4 w-10 border-2 border-border bg-main mb-3" />
          <CardDescription className="text-xs uppercase">Total Game Account</CardDescription>
          <CardTitle className="text-3xl">
            {stats ? String(stats.totalGameAccounts) : statsLoading ? <Spinner className="size-6" /> : "—"}
          </CardTitle>
        </Card>
      </div>

    </main>
  );
}
