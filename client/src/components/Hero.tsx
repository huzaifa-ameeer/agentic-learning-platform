import { HashLink } from "./HashLink";
import { ProtectedLink } from "./ProtectedLink";


const lines = [
  { who: "you", text: "explain closures but make it not boring", tone: "user" },
  { who: "mentor", text: "a closure is a function that remembers where it was born", tone: "bot" },
  { who: "you", text: "...ok that was actually clear", tone: "user" },
  { who: "mentor", text: "want the visual or the spicy version?", tone: "bot" },
];

export function Hero() {
  return (
    <main className="flex flex-1 flex-col items-center gap-12 px-4 py-12 sm:px-20 sm:py-8 lg:flex-row lg:gap-16">
      <section className="flex w-full flex-1 flex-col items-center text-center lg:items-start lg:text-left">
        
        <h1 className="mt-6 font-mono text-4xl font-bold uppercase leading-[1.05] tracking-tight text-crt-ink sm:text-5xl lg:text-6xl">
          Stop
          <br />
          getting
          <br />
          <span className="text-crt-blue">cooked</span> by boring lectures
        </h1>

        <p className="mt-6 max-w-md font-mono text-sm leading-relaxed text-crt-dim sm:text-base">
          Spin up an AI mentor that actually gets your vibe. Stuck on DSA at
          midnight? It doesnt gatekeep. Ask dumb questions, get real answers,
          ship the project.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <ProtectedLink
            href="/play-area"
            className="border-2 border-crt-line bg-crt-blue px-6 py-3 text-center font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000] transition-all duration-100 hover:bg-crt-green hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            start learning
          </ProtectedLink>
          <HashLink
            href="/#how-it-works"
            className="border-2 border-crt-line bg-crt-panel px-6 py-3 text-center font-mono text-sm font-bold uppercase tracking-wider text-crt-ink shadow-[4px_4px_0_0_#000] transition-all duration-100 hover:bg-crt-ink hover:text-crt-panel hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            how it works
          </HashLink>
        </div>
      </section>

      <section className="w-full flex-1 lg:max-w-md">
        <div className="border-2 border-crt-line bg-crt-panel shadow-[6px_6px_0_0_#000]">
          <div className="flex items-center gap-2 border-b-2 border-crt-line bg-crt-line px-4 py-2.5">
            <span className="h-3 w-3 border-2 border-crt-panel bg-crt-blue" />
            <span className="h-3 w-3 border-2 border-crt-panel bg-crt-green" />
            <span className="h-3 w-3 border-2 border-crt-panel bg-crt-dim" />
            <span className="ml-2 font-mono text-[11px] font-bold uppercase tracking-widest text-crt-panel">
              mentor.exe
            </span>
          </div>

          <div className="flex flex-col gap-3 p-4">
            {lines.map((line) => (
              <div key={line.text} className="flex flex-col gap-1">
                <span
                  className={`font-mono text-[10px] font-bold uppercase tracking-widest ${
                    line.tone === "user" ? "text-crt-blue" : "text-crt-green"
                  }`}
                >
                  {line.who}:
                </span>
                <p
                  className={`border-2 px-3 py-2 font-mono text-xs leading-relaxed sm:text-sm ${
                    line.tone === "user"
                      ? "border-crt-blue self-end bg-crt-blue/10 text-crt-ink"
                      : "border-crt-green self-start bg-crt-green/10 text-crt-ink"
                  }`}
                >
                  {line.text}
                </p>
              </div>
            ))}

            <div className="flex items-center gap-1 border-2 border-crt-green bg-crt-green/10 px-3 py-2.5 self-start">
              <span className="h-2 w-2 animate-pulse bg-crt-green" />
              <span className="h-2 w-2 animate-pulse bg-crt-green [animation-delay:200ms]" />
              <span className="h-2 w-2 animate-pulse bg-crt-green [animation-delay:400ms]" />
            </div>
          </div>

          <div className="flex items-center gap-2 border-t-2 border-crt-line px-4 py-3">
            <span className="font-mono text-xs text-crt-green">&gt;</span>
            <span className="flex-1 font-mono text-xs text-crt-dim">
              ask anything...
            </span>
            <span className="h-4 w-[2px] animate-pulse bg-crt-blue" />
          </div>
        </div>
      </section>
    </main>
  );
}

export default Hero;