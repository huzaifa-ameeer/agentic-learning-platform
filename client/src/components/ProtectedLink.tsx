"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, type MouseEvent, type ReactNode } from "react";
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
  const busy = useRef(false);

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

    if (busy.current) {
      onNavigate?.();
      return;
    }

    busy.current = true;
    onNavigate?.();

    let allowed = false;

    try {
      allowed = await isLoggedIn();
    } catch {
      allowed = false;
    }

    busy.current = false;

    router.push(allowed ? href : fallbackHref);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      scroll={false}
    >
      {children}
    </Link>
  );
}

export default ProtectedLink;