import type { Metadata } from "next";

import { Navbar } from "../components/layout/navbar";
import "./globals.css";


export const metadata: Metadata = {
  title: "OH Hike!",
  description: "O Hike! is a sport and health app for teams.",
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
      </body>
    </html>
  );
}
