import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../lib/auth-client";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await signIn.email({ email, password });
      if (res?.error) throw new Error(res.error.message);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-md justify-center px-4 py-12">
      <form onSubmit={onSubmit} className="neo-card w-full p-6 sm:p-8">
        <h1 className="font-display text-3xl uppercase">Login</h1>
        <p className="mt-1 font-mono text-xs uppercase">Members only · 5 fails = lock</p>

        {error && (
          <div className="mt-4 border-3 border-black dark:border-neutral-100 bg-[#FF5C5C] text-white px-3 py-2 font-mono text-sm font-bold">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="neo-label" htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="neo-input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="neo-label" htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="neo-input" placeholder="Min 8 chars" />
          </div>
        </div>

        <button disabled={busy} type="submit" className="neo-btn mt-6 w-full bg-black dark:bg-white text-[#FFD02F] dark:text-black">
          {busy ? "…" : "→ Login"}
        </button>
        <p className="mt-4 text-center font-mono text-xs">
          No account? <Link className="underline font-bold" to="/register">Register</Link>
        </p>
      </form>
    </main>
  );
}
