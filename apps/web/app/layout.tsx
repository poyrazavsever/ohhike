import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

import { getClerkPublishableKey } from "../lib/clerk-env";
import "./globals.css";

export const metadata: Metadata = {
  title: "OhHike CoachOS",
  description: "AI coaching operations platform for sports teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = getClerkPublishableKey();

  return (
    <html lang="en">
      <body>
        <ClerkProvider
          publishableKey={publishableKey || undefined}
          signInUrl="/login"
          signUpUrl="/register"
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
