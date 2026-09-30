"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HashLink } from "./HashLink";
import { getMe, logout, type User } from "@/lib/api";
import { notifySessionChange, onSessionChange } from "@/lib/session";

const links = [
  { label: "home", href: "/" },
  { label: "how it works", href: "/#how-it-works" },
];

const LOGIN_HREF = "/login";

const buttonClass =
  "block border-2 border-crt-line bg-crt-panel px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-crt-ink shadow-[3px_3px_0_0_#000] transition-all duration-100 hover:bg-crt-blue hover:text-white hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] sm:px-4 sm:py-2 sm:text-sm";

export function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    const load = () => {
      getMe()
        .then((data) => {
          if (active) {
            setUser(data.user);
          }
        })
        .catch(() => {
          if (active) {
            setUser(null);
          }
        })
        .finally(() => {
          if (active) {
            setChecked(true);
          }
        });
    };

    load();

    const unsubscribe = onSessionChange(load);

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await logout();
    } catch {
      // even if the request fails, drop local state so the UI stays honest
    }

    setUser(null);
    setChecked(true);
    setLoggingOut(false);
    setOpen(false);
    notifySessionChange();
    router.push("/");
    router.refresh();
  };

  const onResize = () => {
    if (window.innerWidth >= 640) {
      setOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className="w-full border-b-4 border-crt-line bg-crt-bg">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="font-mono text-2xl font-bold uppercase tracking-widest text-crt-blue sm:text-3xl"
        >
          Mentaura
        </Link>

        <ul className="hidden items-center gap-2 sm:flex sm:gap-3">
          {links.map((link) => (
            <li key={link.href}>
              {link.href.includes("#") ? (
                <HashLink href={link.href} className={buttonClass}>
                  {link.label}
                </HashLink>
              ) : (
                <Link href={link.href} className={buttonClass}>
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 sm:flex">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 border-2 border-crt-line bg-crt-green/10 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-crt-green" />
                <span className="max-w-[10rem] truncate font-mono text-xs font-bold uppercase tracking-wider text-crt-ink">
                  {user.name}
                </span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="block border-2 border-crt-line bg-crt-panel px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider text-crt-ink shadow-[3px_3px_0_0_#000] transition-all duration-100 hover:bg-crt-blue hover:text-white hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? "..." : "logout"}
              </button>
            </div>
          ) : checked ? (
            <Link href={LOGIN_HREF} className={buttonClass}>
              login
            </Link>
          ) : null}
        </div>

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
          {user ? (
            <>
              <li>
                <span className="flex items-center justify-center gap-2 border-2 border-crt-line bg-crt-green/10 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-crt-green" />
                  <span className="truncate font-mono text-xs font-bold uppercase tracking-wider text-crt-ink">
                    {user.name}
                  </span>
                </span>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className={`${buttonClass} w-full px-4 py-3 text-center disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {loggingOut ? "logging out..." : "logout"}
                </button>
              </li>
            </>
          ) : checked ? (
            <li>
              <Link
                href={LOGIN_HREF}
                onClick={close}
                className={`${buttonClass} px-4 py-3 text-center`}
              >
                login
              </Link>
            </li>
          ) : null}

          {links.map((link) => (
            <li key={link.href}>
              {link.href.includes("#") ? (
                <HashLink
                  href={link.href}
                  onNavigate={close}
                  className={`${buttonClass} px-4 py-3 text-center`}
                >
                  {link.label}
                </HashLink>
              ) : (
                <Link
                  href={link.href}
                  onClick={close}
                  className={`${buttonClass} px-4 py-3 text-center`}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

export default Navbar;