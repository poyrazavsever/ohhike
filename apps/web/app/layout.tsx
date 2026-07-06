import type { Metadata } from "next";
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
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
