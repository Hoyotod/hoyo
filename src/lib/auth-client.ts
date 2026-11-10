import { createAuthClient } from "better-auth/react";

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
  const { data, isPending } = authClient.useSession();
  const user: SessionUser | null = data?.user
    ? {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name ?? null,
        image: data.user.image ?? null,
      }
    : null;
  return { user, isPending };
}
