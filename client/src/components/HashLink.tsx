"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";

type Props = {
  href: string;
  className?: string;
  onNavigate?: () => void;
  children: ReactNode;
};

export function HashLink({ href, className, onNavigate, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const pendingRef = useRef<string | null>(null);

  useEffect(() => {
    const targetId = pendingRef.current;

    if (!targetId) {
      return;
    }

    pendingRef.current = null;

    const scrollToTarget = () => {
      const target = document.getElementById(targetId);

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      window.requestAnimationFrame(scrollToTarget);
    };

    scrollToTarget();
  }, [pathname]);

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

    const targetId = href.split("#")[1];

    if (!targetId) {
      onNavigate?.();
      return;
    }

    event.preventDefault();

    onNavigate?.();

    const target = document.getElementById(targetId);

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", href);
      return;
    }

    pendingRef.current = targetId;

    router.push(href);
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

export default HashLink;