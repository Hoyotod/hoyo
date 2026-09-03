import prisma from "@/lib/prisma";

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

function windowStart(timestamp = Date.now()) {
  return new Date(Math.floor(timestamp / WINDOW_MS) * WINDOW_MS);
}

export async function isBlocked(identifier: string) {
  const start = windowStart();
  const row = await prisma.loginAttempt.findUnique({
    where: {
      identifier_windowStart: {
        identifier,
        windowStart: start,
      },
    },
  });
  return !!row && row.count >= MAX_FAILURES;
}

export async function recordFailure(identifier: string) {
  const start = windowStart();

  await prisma.$transaction([
    prisma.loginAttempt.upsert({
      where: {
        identifier_windowStart: { identifier, windowStart: start },
      },
      update: { count: { increment: 1 } },
      create: { identifier, windowStart: start, count: 1 },
    }),
    prisma.loginAttempt.deleteMany({
      where: { identifier, windowStart: { lt: start } },
    }),
  ]);
}

export async function recordSuccess(identifier: string) {
  const start = windowStart();

  await prisma.$transaction([
    prisma.loginAttempt.updateMany({
      where: { identifier, windowStart: start },
      data: { count: 0 },
    }),
    prisma.loginAttempt.deleteMany({
      where: { identifier, windowStart: { lt: start } },
    }),
  ]);
}
