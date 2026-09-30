"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

type Props = {
  href: string;
  className?: string;
  onNavigate?: () => void;
  children: ReactNode;
};

export function HashLink({ href, className, onNavigate, children }: Props) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const targetId = href.split("#")[1];

    if (!targetId) {
      return;
    }

    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", href);
    onNavigate?.();
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

export default HashLink;