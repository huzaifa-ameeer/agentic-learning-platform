"use client";

import { useEffect, useState } from "react";

const links = [
  { label: "home", href: "/" },
  { label: "how it works", href: "/how-it-works" },
  { label: "login", href: "/login" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="w-full border-b-4 border-crt-line bg-crt-bg">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <a
          href="/"
          className="font-mono text-2xl font-bold uppercase tracking-widest text-crt-blue transition-transform hover:translate-x-[1px] hover:translate-y-[1px] sm:text-3xl"
        >
          Mentaura
        </a>

        <ul className="hidden items-center gap-2 sm:flex sm:gap-3">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="block border-2 border-crt-line bg-crt-panel px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-crt-ink shadow-[3px_3px_0_0_#000] transition-all duration-100 hover:bg-crt-blue hover:text-white hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] sm:px-4 sm:py-2 sm:text-sm"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "close menu" : "open menu"}
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-[5px] border-2 border-crt-line bg-crt-panel shadow-[3px_3px_0_0_#000] transition-all duration-100 hover:bg-crt-blue hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] sm:hidden"
        >
          <span
            className={`block h-[3px] w-5 bg-crt-ink transition-all duration-200 ${
              open ? "translate-y-[8px] rotate-45" : ""
            } ${open ? "bg-crt-panel" : ""}`}
          />
          <span
            className={`block h-[3px] w-5 bg-crt-ink transition-all duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-[3px] w-5 bg-crt-ink transition-all duration-200 ${
              open ? "-translate-y-[8px] -rotate-45" : ""
            } ${open ? "bg-crt-panel" : ""}`}
          />
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`overflow-hidden border-t-4 border-crt-line transition-[max-height] duration-300 ease-in-out sm:hidden ${
          open ? "max-h-64" : "max-h-0 border-t-0"
        }`}
      >
        <ul className="flex flex-col gap-3 px-4 py-4 sm:px-6">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block border-2 border-crt-line bg-crt-panel px-4 py-3 text-center font-mono text-sm font-bold uppercase tracking-wider text-crt-ink shadow-[3px_3px_0_0_#000] transition-all duration-100 hover:bg-crt-blue hover:text-white hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

export default Navbar;