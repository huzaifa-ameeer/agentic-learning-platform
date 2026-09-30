"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent, type ReactNode } from "react";
import { isLoggedIn } from "@/lib/api";

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
  fallbackHref?: string;
  onNavigate?: () => void;
};

export function ProtectedLink({
  href,
  className,
  children,
  fallbackHref = "/login",
  onNavigate,
}: Props) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    if (checking) {
      return;
    }

    setChecking(true);

    const allowed = await isLoggedIn();

    setChecking(false);
    onNavigate?.();

    router.push(allowed ? href : fallbackHref);
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      aria-busy={checking}
    >
      {children}
    </Link>
  );
}

export default ProtectedLink;