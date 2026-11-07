import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../lib/auth-client";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await signUp.email({ name, email: email.toLowerCase().trim(), password });
      if (res?.error) throw new Error(res.error.message);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-md justify-center px-4 py-12">
      <form onSubmit={onSubmit} className="neo-card w-full p-6 sm:p-8 bg-[#FFD02F] dark:bg-neutral-900">
        <h1 className="font-display text-3xl uppercase">Sign Up</h1>
        <p className="mt-1 font-mono text-xs uppercase">Create account · Free forever</p>

        {error && (
          <div className="mt-4 border-3 border-black dark:border-neutral-100 bg-[#FF5C5C] text-white px-3 py-2 font-mono text-sm font-bold">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="neo-label" htmlFor="name">Name</label>
            <input id="name" required minLength={1} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className="neo-input" placeholder="Your name" />
          </div>
          <div>
            <label className="neo-label" htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="neo-input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="neo-label" htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} className="neo-input" placeholder="Min 8 chars" />
          </div>
        </div>

        <button disabled={busy} type="submit" className="neo-btn mt-6 w-full bg-black dark:bg-white text-[#FFD02F] dark:text-black">
          {busy ? "…" : "Create Account →"}
        </button>
        <p className="mt-4 text-center font-mono text-xs">
          Already have account? <Link className="underline font-bold" to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}
