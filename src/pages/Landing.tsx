import { Link } from "react-router-dom";
import { useSessionUser } from "../lib/auth-client";

export default function Landing() {
  const { user } = useSessionUser();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      <div className="neo-card bg-[#FFD02F] dark:bg-neutral-900 p-6 sm:p-10">
        <p className="neo-badge bg-black dark:bg-white text-[#FFD02F] dark:text-black mb-4">Game Accounts</p>
        <h1 className="font-display text-4xl sm:text-6xl uppercase leading-[0.95]">
          Manage all your HoYo accounts. <span className="bg-black dark:bg-white text-[#FFD02F] dark:text-black px-2">One place.</span>
        </h1>
        <p className="mt-4 max-w-xl font-sans text-base sm:text-lg">
          Store, view, edit and delete your Hoyoverse game accounts. Cookie tokens stay server-side until you need them.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {user ? (
            <Link to="/dashboard" className="neo-btn bg-black dark:bg-white text-[#FFD02F] dark:text-black">→ Dashboard</Link>
          ) : (
            <>
              <Link to="/register" className="neo-btn bg-black dark:bg-white text-[#FFD02F] dark:text-black">Get Started FREE</Link>
              <Link to="/login" className="neo-btn bg-white dark:bg-neutral-800">Login</Link>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {[
          { title: "Secure", color: "bg-[#00D68F]", body: "Tokens never leak in lists. Fetch on-demand only." },
          { title: "Fast", color: "bg-[#5BA4FF]", body: "Cloudflare edge + D1. Auth + API on same network." },
          { title: "Yours", color: "bg-[#FF5C5C]", body: "CRUD as many accounts as you own. No limits." },
        ].map((c) => (
          <div key={c.title} className="neo-card p-5">
            <span className={`inline-block h-4 w-10 border-3 border-black dark:border-neutral-100 ${c.color} mb-3`} />
            <h2 className="font-display text-xl uppercase">{c.title}</h2>
            <p className="mt-1 font-mono text-sm">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="neo-card mt-8 bg-black dark:bg-white text-white dark:text-black p-5 flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono font-bold uppercase text-sm">API Status: <span className="bg-[#00D68F] text-black px-2 py-0.5 border-2 border-black">ONLINE</span></p>
        <p className="font-mono text-xs opacity-80">Workers + D1 · better-auth · Drizzle</p>
      </div>
    </main>
  );
}
