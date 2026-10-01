"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { useSession } from "./SessionProvider";

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
  const { status } = useSession();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    onNavigate?.();

    // the session is already resolved in context, so this needs no round trip
    if (status === "unauthenticated") {
      event.preventDefault();
      router.push(fallbackHref);
      return;
    }

    // authenticated: let next drive the prefetched transition.
    // still loading: navigate anyway and let the destination guard settle it,
    // which costs no extra request because it reads the same in-flight one.
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

export default ProtectedLink;