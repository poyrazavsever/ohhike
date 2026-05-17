"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import type { AccountType } from "../../../lib/account-type";
import { getAccountTypeFromMetadata } from "../../../lib/account-type";
import { getAppUrl } from "../../../lib/site-url";

export async function setAccountTypeAction(accountType: AccountType) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login?redirect_url=/account-type");
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { accountType },
  });

  if (accountType === "coach") {
    redirect(getAppUrl("/onboarding"));
  }

  redirect("/athlete/onboarding");
}

export async function resolveAccountTypeRedirect() {
  const user = await currentUser();

  if (!user) {
    redirect("/login?redirect_url=/account-type");
  }

  const accountType = getAccountTypeFromMetadata(user.publicMetadata);

  if (accountType === "coach") {
    redirect(getAppUrl("/onboarding"));
  }

  if (accountType === "athlete") {
    redirect("/athlete/onboarding");
  }

  return null;
}
