import type { Metadata } from "next";

import { Footer } from "../components/layout/footer";
import { Navbar } from "../components/layout/navbar";
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
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
