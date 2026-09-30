import Link from "next/link";

const LINKS = [
  {
    label: "github",
    href: "https://www.github.com/huzaifa-ameeer/",
    icon: (
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    ),
  },
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/muhammad-huzaifa-ameer-2107aa342/",
    icon: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
];

export function About() {
  return (
    <section className="w-full border-t-4 border-crt-line px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl px-1 sm:px-2">
        <div className="mb-10 flex flex-col items-center gap-2 text-center sm:mb-12">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-crt-blue">
            the human
          </span>
          <h2 className="font-mono text-2xl font-bold uppercase tracking-tight text-crt-ink sm:text-3xl">
            meet huzaifa
          </h2>
        </div>

        <div className="flex flex-col items-center gap-8 border-2 border-crt-line bg-crt-panel px-6 py-10 text-center shadow-[6px_6px_0_0_#000] sm:px-10 lg:flex-row lg:gap-12 lg:py-12 lg:text-left">
          <div className="relative shrink-0">
            <div className="flex h-32 w-32 items-center justify-center border-2 border-crt-line bg-crt-blue font-mono text-5xl font-bold text-white shadow-[5px_5px_0_0_#000] sm:h-40 sm:w-40 sm:text-6xl">
              HA
            </div>
            <span className="absolute -bottom-3 -right-3 border-2 border-crt-line bg-crt-green px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
              dev
            </span>
          </div>

          <div className="flex-1">
            <h3 className="font-mono text-xl font-bold uppercase tracking-wider text-crt-ink sm:text-2xl">
              Huzaifa Ameer
            </h3>

            <p className="mt-1.5 font-mono text-xs uppercase tracking-wider text-crt-blue">
              software engineer
            </p>

            <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-crt-dim">
              the one who built Mentaura from scratch. backend, frontend, the
              lot. if a mentor gives you a garbage answer that is entirely my
              fault and i accept that.
            </p>

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:items-center">
              <Link
                href="/"
                className="flex w-full items-center justify-center gap-2.5 border-2 border-crt-line bg-crt-panel px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-crt-ink shadow-[4px_4px_0_0_#000] transition-all duration-100 hover:bg-crt-blue hover:text-white hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] sm:w-auto"
              >
                back to home
              </Link>

              {LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2.5 border-2 border-crt-line bg-crt-bg px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-crt-ink shadow-[4px_4px_0_0_#000] transition-all duration-100 hover:bg-crt-ink hover:text-crt-panel hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] sm:w-auto"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="square"
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  >
                    {link.icon}
                  </svg>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;