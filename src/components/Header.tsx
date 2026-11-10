import { Link, useNavigate } from "react-router-dom";
import { signOut, useSessionUser } from "../lib/auth-client";
import { Button, buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Header() {
  const { user } = useSessionUser();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-secondary-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center border-2 border-border bg-main font-heading text-xl text-main-foreground shadow-shadow">H</span>
          <span className="font-heading text-xl uppercase tracking-tight">Hoyo</span>
        </Link>
        <nav className="flex h-10 items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className={buttonVariants({ variant: "neutral" })}>Dashboard</Link>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button>Menu</Button>} />
                <DropdownMenuContent align="end" className="shadow-shadow">
                  <DropdownMenuLabel className="max-w-[180px] truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login" className={buttonVariants({ variant: "neutral" })}>Login</Link>
              <Link to="/register" className={buttonVariants({ variant: "default" })}>Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
