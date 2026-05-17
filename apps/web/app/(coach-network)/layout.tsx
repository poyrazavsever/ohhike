import { notFound } from "next/navigation";

import { Footer } from "../../components/layout/footer";
import { Navbar } from "../../components/layout/navbar";
import { isCoachNetworkEnabled } from "../../lib/coach-network";

export default function CoachNetworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isCoachNetworkEnabled()) {
    notFound();
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
