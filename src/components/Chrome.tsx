"use client";
import { usePathname } from "next/navigation";
import { TopBar } from "./Nav";
import { ContactSection } from "./ContactSection";

export function Chrome({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");
  if (isStudio) return <>{children}</>;
  return (
    <>
      <TopBar />
      <main className="main">{children}</main>
      <ContactSection />
      {footer}
    </>
  );
}
