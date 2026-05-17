type InviteEmailInput = {
  to: string;
  organizationName: string;
  claimUrl: string;
  kind: "athlete" | "staff";
};

export async function sendInviteEmail(input: InviteEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.INVITE_EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    return false;
  }

  const roleLabel = input.kind === "athlete" ? "athlete" : "staff member";
  const subject =
    input.kind === "athlete"
      ? `Join ${input.organizationName} on OhHike`
      : `Staff invitation to ${input.organizationName}`;
  const text = [
    `You were invited to join ${input.organizationName} on OhHike as a ${roleLabel}.`,
    "",
    "Open this invite link:",
    input.claimUrl,
    "",
    "This link expires in 14 days. If you were not expecting this invitation, you can ignore this email.",
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject,
      text,
    }),
  });

  return response.ok;
}
