"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getMe } from "@/lib/api";

export function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    getMe()
      .then((data) => {
        if (!active) {
          return;
        }

        if (data.user?.role === "admin") {
          setAllowed(true);
          return;
        }

        router.replace("/admin/login");
      })
      .catch(() => {
        if (active) {
          router.replace("/admin/login");
        }
      });

    return () => {
      active = false;
    };
  }, [router]);

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
