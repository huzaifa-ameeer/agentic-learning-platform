"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getMe } from "@/lib/api";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ok" | "denied">(
    "checking",
  );

  useEffect(() => {
    let active = true;

    getMe()
      .then(() => {
        if (active) {
          setStatus("ok");
        }
      })
      .catch(() => {
        if (active) {
          setStatus("denied");
          router.replace("/login");
        }
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (status === "denied") {
    return null;
  }

  if (status === "checking") {
    return (
      <section className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin border-4 border-crt-line border-t-crt-blue" />
          <p className="font-mono text-xs uppercase tracking-widest text-crt-dim">
            checking session...
          </p>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}

export default AuthGuard;