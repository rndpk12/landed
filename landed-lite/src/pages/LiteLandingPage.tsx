import { ArrowRight, Check, Chrome, Download, LockKeyhole, MousePointer2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const steps = [
  ['01', 'Add a role', 'Drop in a company, role, link, and the stage you are at.'],
  ['02', 'Keep it moving', 'Update your pipeline and notes as your search progresses.'],
  ['03', 'Own your data', 'Your job search stays in this browser until you choose to export it.']
];

const promises = [
  'No sign-up or password',
  'No cloud profile to maintain',
  'No tracking of your applications',
  'Export a backup whenever you want'
];

export const LiteLandingPage = () => (
  <main className="landed-brutal min-h-screen overflow-x-hidden bg-[#fbf7ef] text-[#080808] antialiased">
    <nav className="sticky top-0 z-20 border-b-[3px] border-black bg-[#fffaf1]/95 px-5 py-3 backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <a href="#top" aria-label="Landed Lite home">
          <BrandLogo className="h-9 w-auto sm:h-10" />
        </a>
        <div className="hidden items-center gap-7 md:flex">
          <button className="text-xs font-black uppercase hover:text-[#f97316]" type="button" onClick={() => scrollTo('how-it-works')}>
            How it works
          </button>
          <button className="text-xs font-black uppercase hover:text-[#f97316]" type="button" onClick={() => scrollTo('privacy')}>
            Your data
          </button>
          <Link className="text-xs font-black uppercase text-black no-underline hover:text-[#f97316]" to="/feedback">Feedback</Link>
        </div>
        <button
          className="inline-flex items-center gap-2 border-[3px] border-black bg-[#f97316] px-3 py-2 text-xs font-black uppercase text-white shadow-[4px_4px_0_#000] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000]"
          type="button"
          onClick={() => scrollTo('get-started')}
        >
          Try Lite <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </nav>

    <section id="top" className="brutal-grid px-5 pb-10 pt-10 md:px-8 md:pb-12 md:pt-12">
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1fr_0.92fr]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 border-2 border-black bg-[#f9d44a] px-3 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#000]">
            <MousePointer2 className="h-4 w-4" /> Browser-first job tracking
          </div>
          <p className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-[#f97316]">Meet Landed Lite</p>
          <h1 className="max-w-3xl text-[clamp(2.8rem,5.4vw,5.5rem)] font-black uppercase leading-[0.86] tracking-[-0.06em]">
            Your job search.<br />
            <span className="whitespace-nowrap text-[#f97316]">No account.</span><br />
            No noise.
          </h1>
          <p className="mt-5 max-w-xl text-base font-bold leading-7 text-[#535353]">
            Landed Lite is a focused job tracker that starts in seconds. Add applications, follow your pipeline,
            and keep your search private on your device.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              className="inline-flex items-center gap-3 border-[3px] border-black bg-black px-6 py-4 text-sm font-black uppercase text-white no-underline shadow-[6px_6px_0_#f97316] transition hover:-translate-y-1 hover:shadow-[9px_9px_0_#f97316]"
              to="/app"
            >
              Start tracking free <ArrowRight className="h-5 w-5" />
            </Link>
            <button
              className="inline-flex items-center gap-2 px-2 py-3 text-sm font-black uppercase underline decoration-2 underline-offset-4 hover:text-[#f97316]"
              type="button"
              onClick={() => scrollTo('how-it-works')}
            >
              See how it works
            </button>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-black text-[#4d4d4d]">
            {['No credit card', 'No registration', 'Private by default'].map((item) => (
              <span className="flex items-center gap-2" key={item}><Check className="h-4 w-4 text-[#f97316]" />{item}</span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[455px] lg:-translate-y-4 lg:justify-self-end">
          <div className="absolute -right-2 -top-7 rotate-3 border-[3px] border-black bg-[#5dd6e4] px-3 py-2 text-xs font-black uppercase shadow-[4px_4px_0_#000] sm:right-4">
            Saved locally
          </div>
          <div className="border-[4px] border-black bg-white shadow-[10px_10px_0_#000]">
            <div className="flex items-center gap-2 border-b-[3px] border-black bg-[#f5ead8] px-4 py-3">
              <span className="h-3 w-3 border-2 border-black bg-[#f97316]" />
              <span className="h-3 w-3 border-2 border-black bg-[#f9d44a]" />
              <span className="h-3 w-3 border-2 border-black bg-[#96d35f]" />
              <p className="ml-2 text-xs font-black uppercase">Landed Lite</p>
            </div>
            <div className="p-5 sm:p-6">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-[#777]">Your pipeline</p>
                  <h2 className="mt-1 text-3xl font-black uppercase leading-none">This week</h2>
                </div>
                <button className="border-[3px] border-black bg-[#f97316] px-3 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0_#000]" type="button">
                  + Add job
                </button>
              </div>
              <div className="space-y-3">
                {[
                  ['Orbit', 'Product Designer', 'Applied', '#5dd6e4'],
                  ['Northstar', 'UX Researcher', 'Interview', '#f9d44a'],
                  ['Kite', 'Design Systems', 'Saved', '#96d35f']
                ].map(([company, role, stage, color]) => (
                  <div className="flex items-center gap-3 border-[3px] border-black p-3" key={company}>
                    <span className="grid h-9 w-9 place-items-center border-2 border-black bg-black text-sm font-black text-white">{company[0]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">{company}</p>
                      <p className="truncate text-xs font-bold text-[#666]">{role}</p>
                    </div>
                    <span className="border-2 border-black px-2 py-1 text-[10px] font-black uppercase" style={{ backgroundColor: color }}>{stage}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 border-t-2 border-black pt-3 text-xs font-bold text-[#666]">Stored in this browser. Export when you are ready.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="how-it-works" className="border-y-[3px] border-black bg-black px-5 py-14 text-white md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#f97316]">A lighter way to organize</p>
        <div className="mt-3 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <h2 className="max-w-2xl text-4xl font-black uppercase leading-none sm:text-5xl">From job tab to clear next step.</h2>
          <p className="max-w-sm text-base font-bold leading-7 text-[#c7c7c7]">No onboarding maze. No account form. Just the essentials for an organized search.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map(([number, title, description]) => (
            <article className="border-[3px] border-white bg-[#151515] p-5" key={number}>
              <span className="text-3xl font-black text-[#f97316]">{number}</span>
              <h3 className="mt-8 text-xl font-black uppercase">{title}</h3>
              <p className="mt-3 text-sm font-bold leading-6 text-[#c7c7c7]">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section id="privacy" className="brutal-grid px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-[4px] border-black bg-[#f97316] p-7 shadow-[8px_8px_0_#000] sm:p-9">
          <LockKeyhole className="h-10 w-10" strokeWidth={2.5} />
          <h2 className="mt-12 text-4xl font-black uppercase leading-none">Your applications stay yours.</h2>
          <p className="mt-5 text-base font-bold leading-7">Landed Lite is designed for people who want control, not another account to manage.</p>
        </div>
        <div className="border-[4px] border-black bg-white p-7 shadow-[8px_8px_0_#000] sm:p-9">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-[#f97316]" />
            <p className="text-sm font-black uppercase">Lite promise</p>
          </div>
          <ul className="mt-8 space-y-4">
            {promises.map((promise) => (
              <li className="flex items-start gap-3 text-base font-black" key={promise}>
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#f97316]" strokeWidth={3} /> {promise}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <section id="get-started" className="border-t-[3px] border-black bg-[#f9d44a] px-5 py-16 text-center md:px-8 md:py-20">
      <div className="mx-auto max-w-3xl">
        <Chrome className="mx-auto h-10 w-10" strokeWidth={2.5} />
        <h2 className="mt-5 text-4xl font-black uppercase leading-none sm:text-6xl">Ready when you are.</h2>
        <p className="mx-auto mt-5 max-w-xl text-lg font-bold leading-8">Start your local application board now. Nothing to sign up for and nothing to wait on.</p>
        <Link className="mt-8 inline-flex items-center gap-3 border-[3px] border-black bg-black px-6 py-4 text-sm font-black uppercase text-white no-underline shadow-[6px_6px_0_#f97316] transition hover:-translate-y-1 hover:shadow-[9px_9px_0_#f97316]" to="/app">
          Explore Landed Lite <Download className="h-5 w-5" />
        </Link>
      </div>
    </section>

    <footer className="border-t-[3px] border-black bg-[#fffaf1] px-5 py-7 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm font-bold text-[#555] sm:flex-row sm:items-center sm:justify-between">
        <BrandLogo className="h-8 w-auto" />
        <p>Made with ❤️ for 🇮🇳</p>
        <p>© 2026 Landed</p>
      </div>
    </footer>
  </main>
);
