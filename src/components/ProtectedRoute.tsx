import { Navigate } from "react-router-dom";
import { useSessionUser } from "../lib/auth-client";
import type { ReactNode } from "react";
import { Card } from "./ui/card";
import { Spinner } from "./ui/spinner";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isPending } = useSessionUser();
  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="px-6 py-4 font-bold uppercase flex items-center gap-2"><Spinner /> Loading…</Card>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
