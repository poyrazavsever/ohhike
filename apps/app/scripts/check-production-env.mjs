#!/usr/bin/env node

const required = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SIGNING_SECRET",
];

const optional = [
  "GEMINI_API_KEY",
  "GEMINI_MODEL",
  "GEMINI_EMBEDDING_MODEL",
  "RESEND_API_KEY",
  "INVITE_EMAIL_FROM",
];

const missing = required.filter((key) => {
  if (key === "CLERK_WEBHOOK_SIGNING_SECRET") {
    return !(
      process.env.CLERK_WEBHOOK_SIGNING_SECRET?.trim() ||
      process.env.CLERK_WEBHOOK_SECRET?.trim()
    );
  }

  return !process.env[key]?.trim();
});
const optionalMissing = optional.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  console.error("Missing required env vars:\n");
  for (const key of missing) {
    console.error(`  - ${key}`);
  }
  console.error("\nSee apps/app/.env.example");
  process.exit(1);
}

console.log("Required production env vars are set.");
if (optionalMissing.length > 0) {
  console.log("Optional (AI):", optionalMissing.join(", "));
}
