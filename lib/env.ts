const REQUIRED = ["DATABASE_URL", "AUTH_SECRET"] as const;

export function assertEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        "Check your .env file."
    );
  }
}

assertEnv();
