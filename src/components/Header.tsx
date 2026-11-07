import { Link, useNavigate } from "react-router-dom";
import { signOut, useSessionUser } from "../lib/auth-client";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { user } = useSessionUser();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b-3 border-black dark:border-neutral-100 bg-[#FFD02F] dark:bg-neutral-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center border-3 border-black dark:border-neutral-100 bg-black dark:bg-white font-display text-xl text-[#FFD02F] dark:text-black shadow-neo-sm">H</span>
          <span className="font-display text-xl uppercase tracking-tight">Hoyo</span>
          <span className="neo-badge bg-white dark:bg-neutral-800 hidden sm:inline">API+WEB</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="neo-btn bg-white dark:bg-neutral-800 text-xs sm:text-sm">Dashboard</Link>
              <Link to="/profile" className="neo-btn bg-[#FF5C5C] dark:bg-[#7f1d1d] text-white text-xs sm:text-sm hidden sm:inline">Profile</Link>
              <span className="hidden md:inline font-mono text-xs border-3 border-black dark:border-neutral-100 bg-white dark:bg-neutral-800 px-2 py-1 max-w-[180px] truncate">{user.email}</span>
              <button onClick={handleSignOut} className="neo-btn bg-black dark:bg-white text-[#FFD02F] dark:text-black text-xs sm:text-sm">Exit</button>
            </>
          ) : (
            <>
              <Link to="/login" className="neo-btn bg-white dark:bg-neutral-800 text-xs sm:text-sm">Login</Link>
              <Link to="/register" className="neo-btn bg-black dark:bg-white text-[#FFD02F] dark:text-black text-xs sm:text-sm">Sign Up</Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
