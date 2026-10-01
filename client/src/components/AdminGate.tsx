"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useSession } from "./SessionProvider";

export function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, status } = useSession();
  const allowed = status === "authenticated" && user?.role === "admin";

  useEffect(() => {
    if (status !== "loading" && !allowed) {
      router.replace("/admin/login");
    }
  }, [router, status, allowed]);

  if (allowed) {
    return children;
  }

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <div className="flex w-full max-w-md flex-col items-center gap-4 border-4 border-crt-line bg-crt-panel p-6 text-center shadow-[6px_6px_0_0_#000]">
        <span className="h-9 w-9 animate-spin border-4 border-crt-line border-t-crt-blue" />

        <p className="font-mono text-xs font-bold uppercase tracking-widest text-crt-ink">
          verifying credentials
        </p>

        <p className="font-mono text-xs leading-relaxed text-crt-dim">
          checking your admin session. if it is not there, you will land on the
          login screen.
        </p>
      </div>
    </section>
  );
}

export default AdminGate;