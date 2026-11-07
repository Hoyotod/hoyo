import { createAuthClient } from "better-auth/client";
import { useEffect, useState } from "react";

const baseURL = import.meta.env.VITE_API_URL || "";

export const authClient = createAuthClient({ baseURL });

export const { signIn, signUp, signOut } = authClient;

interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export function useSessionUser() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await authClient.getSession();
        if (!cancelled && data?.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name ?? null,
            image: data.user.image ?? null,
          });
        }
      } catch {
        // not logged in
      } finally {
        if (!cancelled) setIsPending(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { user, isPending };
}
