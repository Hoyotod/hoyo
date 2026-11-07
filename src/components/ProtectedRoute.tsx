import { Navigate } from "react-router-dom";
import { useSessionUser } from "../lib/auth-client";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isPending } = useSessionUser();
  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="neo-card px-6 py-4 font-mono font-bold uppercase">Loading…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
