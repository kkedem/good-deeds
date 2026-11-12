"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { useSession } from "@/lib/client/session";

const GUEST_ALLOWED = (pathname: string) =>
  pathname === "/find" || pathname.startsWith("/opportunity/");

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const guestAllowed = GUEST_ALLOWED(pathname);

  useEffect(() => {
    if (!loading && !user && !guestAllowed) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, guestAllowed, pathname, router]);

  if (loading) return null;
  if (!user && !guestAllowed) return null;

  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
