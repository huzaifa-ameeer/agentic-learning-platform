import Link from "next/link";
import { HashLink } from "@/components/HashLink";

const primaryClass =
  "border-2 border-crt-line bg-crt-blue px-6 py-3 text-center font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000] transition-all duration-100 hover:bg-crt-green hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]";

const secondaryClass =
  "border-2 border-crt-line bg-crt-panel px-6 py-3 text-center font-mono text-sm font-bold uppercase tracking-wider text-crt-ink shadow-[4px_4px_0_0_#000] transition-all duration-100 hover:bg-crt-ink hover:text-crt-panel hover:shadow-[2px_2px_0_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]";

export default function NotFound() {
  return (
    <section className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 sm:py-20">
      <div className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
        <span className="flex items-center gap-2 border-2 border-crt-line bg-crt-panel px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-crt-dim shadow-[3px_3px_0_0_#000]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-crt-red" />
          404_not_found.exe
        </span>

        <h1 className="font-mono text-7xl font-bold uppercase leading-none tracking-tight text-crt-blue sm:text-8xl">
          404
        </h1>

        <div className="flex flex-col items-center gap-3">
          <h2 className="font-mono text-xl font-bold uppercase tracking-tight text-crt-ink sm:text-2xl">
            dead link, no mentor here
          </h2>

          <p className="max-w-md font-mono text-sm leading-relaxed text-crt-dim">
            this page took a wrong turn somewhere. the url you followed does not
            exist, or it got moved and nobody told the links.
          </p>
        </div>

        <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <Link href="/" className={primaryClass}>
            back to home
          </Link>

          <HashLink href="/#how-it-works" className={secondaryClass}>
            how it works
          </HashLink>
        </div>
      </div>
    </section>
  );
}