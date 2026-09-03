"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";

export type RegisterResult = {
  success: boolean;
  error?: string;
};

export async function registerUser(formData: FormData): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid registration details" };
  }

  const { name, email, password } = parsed.data;

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
      },
    });
    return { success: true };
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code?: string }).code === "P2002"
    ) {
      return { success: false, error: "Email already registered" };
    }
    throw e;
  }
}
