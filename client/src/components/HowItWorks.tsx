import { ProtectedLink } from "./ProtectedLink";

const steps = [
  {
    id: "01",
    title: "login / signup",
    text: "make an account in 5 seconds. no credit card, no demo gate, just vibes and a password.",
    icon: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" />
      </>
    ),
  },
  {
    id: "02",
    title: "choose agent",
    text: "pick a mentor that matches your energy. DSA grinder? debate champ? vibes-based tutor?",
    icon: (
      <>
        <rect x="4" y="6" width="16" height="13" rx="2" />
        <path d="M12 3v3M9 11v2M15 11v2M9 16h6" />
      </>
    ),
  },
  {
    id: "03",
    title: "create session",
    text: "spin up a session and just talk. every chat is saved, so you pick up exactly where you left off.",
    icon: (
      <>
        <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H9l-5 4V6z" />
        <path d="M8 9h8M8 12h5" />
      </>
    ),
  },
  {
    id: "04",
    title: "start cooking",
    text: "ask dumb questions, get real answers. the agent remembers the whole thread while you cook.",
    icon: (
      <>
        <path d="M12 3v9" />
        <path d="M8.5 8.5L12 12l3.5-3.5" />
        <path d="M4 15c2 3 5 4.5 8 4.5s6-1.5 8-4.5" />
      </>
    ),
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="w-full scroll-mt-4 border-t-4 border-crt-line px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col items-center gap-2 text-center sm:mb-10">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-crt-blue">
            how it works
          </span>
          <h2 className="font-mono text-2xl font-bold uppercase tracking-tight text-crt-ink sm:text-3xl">
            four steps, thats it
          </h2>
        </div>

        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.id}>
              <article className="group relative flex h-full flex-col border-2 border-crt-line bg-crt-panel p-5 shadow-[5px_5px_0_0_#2563eb] transition-all duration-150 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[10px_10px_0_0_#2563eb]">
                <span className="absolute right-4 top-4 font-mono text-3xl font-bold text-crt-ink/15 transition-colors duration-150 group-hover:text-crt-blue/40">
                  {step.id}
                </span>

                <span className="flex h-12 w-12 items-center justify-center border-2 border-crt-line bg-crt-bg shadow-[3px_3px_0_0_#000] transition-all duration-150 group-hover:bg-crt-blue">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="square"
                    className="h-6 w-6 text-crt-ink transition-colors duration-150 group-hover:text-white"
                  >
                    {step.icon}
                  </svg>
                </span>

                <h3 className="mt-5 font-mono text-base font-bold uppercase tracking-wider text-crt-ink">
                  {step.title}
                </h3>

                <p className="mt-2 font-mono text-xs leading-relaxed text-crt-dim">
                  {step.text}
                </p>
              </article>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex justify-center sm:mt-10">
          <ProtectedLink
            href="/play-area"
            className="border-2 border-crt-line bg-crt-blue px-6 py-3 text-center font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000] transition-all duration-100 hover:bg-crt-green hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            start cooking
          </ProtectedLink>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;