export type AccountType = "athlete" | "coach";

export function getAccountTypeFromMetadata(
  metadata: Record<string, unknown> | undefined | null,
): AccountType | null {
  const value = metadata?.accountType;

  if (value === "athlete" || value === "coach") {
    return value;
  }

  return null;
}
