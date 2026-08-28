import { ArrowRight, Check, Chrome, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="brutal-grid relative min-h-[88vh] overflow-hidden px-5 pb-9 pt-[104px] md:px-8 lg:pt-[112px]">
      <div className="mx-auto grid max-w-[1160px] items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="mb-5 inline-flex animate-[fadeUp_0.7s_ease_both_0.05s] items-center gap-2 border-2 border-[#f3d8b9] bg-[#fff6e8] px-4 py-2 text-[13px] font-black uppercase text-[#7a3515] shadow-[3px_3px_0_rgba(0,0,0,0.12)]">
            <Sparkles className="h-4 w-4 text-[#f97316]" />
            Stop tracking. Start landing.
          </div>

          <h1 className="max-w-[640px] animate-[fadeUp_0.7s_ease_both_0.18s] text-[clamp(48px,5.8vw,76px)] font-black uppercase leading-[0.94] text-black">
            <span className="block whitespace-nowrap">Job search</span>
            <span className="block whitespace-nowrap text-[#f97316]">100x faster</span>
            <span className="block whitespace-nowrap">with Landed.</span>
          </h1>

          <p className="mt-6 max-w-[520px] animate-[fadeUp_0.7s_ease_both_0.3s] text-[17px] font-bold leading-[1.7] text-[#4d4d4d]">
            Landed keeps your resumes, job links, pipeline stages, interview notes, and performance
            signals in one sharp workspace. No more guessing which file went where.
          </p>

          <div className="mt-7 flex animate-[fadeUp_0.7s_ease_both_0.42s] flex-wrap items-center gap-4">
            <button
              className="group inline-flex items-center gap-3 border-[3px] border-black bg-black px-7 py-4 text-[15px] font-black uppercase text-white shadow-[6px_6px_0_#f97316] transition hover:-translate-y-1 hover:shadow-[9px_9px_0_#f97316]"
              type="button"
              onClick={() => navigate('/login?mode=register')}
            >
              Start for free
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </button>
            <a
              className="inline-flex items-center gap-2 text-[14px] font-black uppercase text-[#4d4d4d] no-underline transition hover:text-black"
              href="#features"
            >
              <Chrome className="h-5 w-5" />
              Works in browser
            </a>
          </div>

          <div className="mt-9 grid max-w-[560px] animate-[fadeUp_0.7s_ease_both_0.54s] grid-cols-1 gap-4 text-[14px] font-black text-[#4d4d4d] sm:grid-cols-3">
            {['Resume vault', 'Job import', 'Stage analytics'].map((item) => (
              <div className="flex items-center gap-2" key={item}>
                <span className="grid h-6 w-6 place-items-center border-2 border-[#f3d8b9] bg-white text-[#f97316]">
                  <Check className="h-4 w-4" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <HeroMockup />
      </div>
    </section>
  );
};

const HeroMockup = () => (
  <div className="relative animate-[fadeUp_0.75s_ease_both_0.28s] lg:pl-4">
    <div className="absolute -right-5 -top-8 hidden rotate-3 border-[3px] border-black bg-[#5dd6e4] px-4 py-2 text-[12px] font-black uppercase shadow-[5px_5px_0_#000] md:block">
      AI match score: 91
    </div>
    <div className="brutal-window relative bg-white">
      <div className="flex items-center gap-2 border-b-[3px] border-black bg-[#f8efe2] px-4 py-3">
        <span className="h-3 w-3 border-2 border-black bg-[#ef4444]" />
        <span className="h-3 w-3 border-2 border-black bg-[#facc15]" />
        <span className="h-3 w-3 border-2 border-black bg-[#22c55e]" />
        <div className="ml-3 flex-1 border-2 border-black bg-white px-3 py-1 text-center text-[11px] font-black text-[#4d4d4d]">
          app.landed.dev/applications
        </div>
      </div>

      <div className="grid min-h-[390px] grid-cols-1 lg:grid-cols-[1fr_230px]">
        <div className="border-b-[3px] border-black p-5 lg:border-b-0 lg:border-r-[3px]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase text-[#777]">Job application</p>
              <h3 className="text-xl font-black text-black">Senior Frontend Engineer</h3>
            </div>
            <span className="shrink-0 border-2 border-black bg-[#f97316] px-3 py-1 text-[11px] font-black uppercase text-white">
              Interview
            </span>
          </div>

          <div className="space-y-4">
            {[
              ['Company', 'Stripe'],
              ['Resume', 'Frontend_v6.pdf'],
              ['Source', 'Greenhouse'],
              ['Next action', 'Send follow-up']
            ].map(([label, value], index) => (
              <div className="group" key={label}>
                <div className="mb-1 text-[10px] font-black uppercase text-[#777]">{label}</div>
                <div className="relative h-10 overflow-hidden border-[3px] border-black bg-[#fffaf1] px-3 py-2 text-sm font-black">
                  <span>{value}</span>
                  {index < 3 ? (
                    <span className="absolute inset-y-0 left-0 w-1/3 bg-[#f97316]/20 animate-[scan-fill_2.8s_ease-in-out_infinite]" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <button className="mt-6 w-full border-[3px] border-black bg-[#f97316] px-5 py-3 text-[13px] font-black uppercase text-white shadow-[4px_4px_0_#000]">
            Update stage
          </button>
        </div>

        <div className="flex flex-col gap-4 bg-[#fffaf1] p-5">
          <div className="border-[3px] border-black bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-[12px] font-black uppercase">
              <span className="grid h-7 w-7 place-items-center bg-[#f97316] text-white">AI</span>
              Resume signal
            </div>
            <p className="text-[12px] font-bold leading-5 text-[#4d4d4d]">
              This version highlights React impact and metrics. Callback rate is trending up.
            </p>
          </div>
          <div className="border-[3px] border-black bg-white p-4">
            <p className="mb-3 text-[12px] font-black uppercase">Pipeline</p>
            <div className="space-y-2">
              {['Applied', 'Screening', 'Interview', 'Offer'].map((stage, index) => (
                <div className="flex items-center gap-2" key={stage}>
                  <span
                    className={`h-4 w-4 border-2 border-black ${index < 3 ? 'bg-[#96d35f]' : 'bg-white'}`}
                  />
                  <span className="text-[12px] font-black">{stage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
