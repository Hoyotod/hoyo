"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authOptions } from "@/auth";
import { updateProfileSchema } from "@/lib/validation";

export type UpdateProfileResult = {
  success: boolean;
  user?: { name: string | null; email: string; webhook: string | null };
  passwordChanged?: boolean;
};

export async function updateProfile(
  formData: FormData
): Promise<UpdateProfileResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password") ?? "",
    webhook: formData.get("webhook") ?? "",
  });

  if (!parsed.success) {
    return { success: false };
  }

  const { name, email, password, webhook } = parsed.data;

  const data: {
    name: string;
    email: string;
    webhook: string | null;
    password?: string;
  } = {
    name,
    email,
    webhook: webhook ?? null,
  };

  const passwordChanged = !!password && password.length > 0;

  if (passwordChanged) {
    data.password = await bcrypt.hash(password, 10);
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { name: true, email: true, webhook: true },
    });

    if (passwordChanged) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { sessionVersion: { increment: 1 } },
      });
    }

    revalidatePath("/profile");
    return { success: true, user, passwordChanged };
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code?: string }).code === "P2002"
    ) {
      return { success: false };
    }
    throw e;
  }
}
