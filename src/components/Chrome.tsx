"use client";
import { usePathname } from "next/navigation";
import { TopBar } from "./Nav";
import { LookSwitcher } from "./LookSwitcher";

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
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <TopBar />
      <main className="main" id="main" tabIndex={-1}>{children}</main>
      {footer}
      <LookSwitcher />
    </>
  );
}
