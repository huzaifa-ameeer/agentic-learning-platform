"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HashLink } from "./HashLink";

const explore = [
  { label: "home", href: "/" },
  { label: "how it works", href: "/#how-it-works" },
  { label: "login", href: "/login" },
];

const socials = [
  { label: "github", href: "https://www.github.com/huzaifa-ameeer/" },
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/muhammad-huzaifa-ameer-2107aa342/",
  },
];

export function Footer() {
  const pathname = usePathname();

  const isChatRoute =
    /^\/sessions\/[^/]+$/.test(pathname) && pathname !== "/sessions/new";

  if (isChatRoute) {
    return null;
  }

  return (
    <footer className="mt-auto w-full border-t-4 border-crt-line bg-crt-bg">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:py-12">
        <div className="max-w-xs">
          <p className="font-mono text-xl font-bold uppercase tracking-widest text-crt-blue">
            Mentaura
          </p>
          <p className="mt-3 font-mono text-xs leading-relaxed text-crt-dim">
            ai mentors that dont gatekeep. built by huzaifa ameer, one commit at
            a time.
          </p>
        </div>

        <div className="flex gap-12 sm:gap-16">
          <div>
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-crt-ink">
              explore
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {explore.map((link) => (
                <li key={link.href}>
                  {link.href.includes("#") ? (
                    <HashLink
                      href={link.href}
                      className="font-mono text-xs uppercase tracking-wider text-crt-dim transition-colors duration-100 hover:text-crt-blue"
                    >
                      {link.label}
                    </HashLink>
                  ) : (
                    <Link
                      href={link.href}
                      className="font-mono text-xs uppercase tracking-wider text-crt-dim transition-colors duration-100 hover:text-crt-blue"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-crt-ink">
              elsewhere
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {socials.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs uppercase tracking-wider text-crt-dim transition-colors duration-100 hover:text-crt-blue"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-crt-line">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
          <p className="font-mono text-[10px] uppercase tracking-wider text-crt-dim">
            &copy; {new Date().getFullYear()} mentaura. all rights reserved
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-crt-dim">
            built with next.js + express + gemini
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;