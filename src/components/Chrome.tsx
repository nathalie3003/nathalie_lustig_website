"use client";
import { usePathname } from "next/navigation";
import { TopBar } from "./Nav";
import { ContactFooter } from "./Footer";

export function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");
  if (isStudio) return <>{children}</>;
  return (
    <>
      <TopBar />
      <main className="main">{children}</main>
      <ContactFooter />
    </>
  );
}
