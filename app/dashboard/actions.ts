"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { authOptions } from "@/auth";
import { accountSchema } from "@/lib/validation";

export async function addAccount(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    accountId: formData.get("accountId"),
    cookieToken: formData.get("cookieToken"),
  });

  if (!parsed.success) {
    return false;
  }

  const { name, accountId, cookieToken } = parsed.data;

  try {
    await prisma.account.create({
      data: {
        name,
        accountId,
        cookieToken,
        userId: session.user.id,
      },
    });
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code?: string }).code === "P2002"
    ) {
      return false;
    }
    throw e;
  }

  revalidatePath("/dashboard");
  return true;
}

export async function updateAccount(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const id = formData.get("id")?.toString().trim();

  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    accountId: formData.get("accountId"),
    cookieToken: formData.get("cookieToken"),
  });

  if (!id || !parsed.success) {
    return false;
  }

  const { name, accountId, cookieToken } = parsed.data;

  const updated = await prisma.account.updateMany({
    where: { id, userId: session.user.id },
    data: { name, accountId, cookieToken },
  });

  if (updated.count === 0) {
    return false;
  }

  revalidatePath("/dashboard");
  return true;
}

export async function getCookieToken(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const id = formData.get("id")?.toString().trim();

  if (!id) {
    return null;
  }

  const account = await prisma.account.findFirst({
    where: { id, userId: session.user.id },
    select: { cookieToken: true },
  });

  return account?.cookieToken ?? null;
}

export async function deleteAccount(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const id = formData.get("id")?.toString().trim();

  if (!id) {
    return false;
  }

  const deleted = await prisma.account.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (deleted.count === 0) {
    return false;
  }

  revalidatePath("/dashboard");
  return true;
}
