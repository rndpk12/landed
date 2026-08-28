import { ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Reveal } from './Reveal';

export const ProofSection = () => (
  <section className="brutal-grid px-5 pb-24 md:px-8" id="proof">
    <Reveal className="mx-auto max-w-[1080px]">
      <div className="grid gap-6 md:grid-cols-4">
        {[
          ['3x', 'more callbacks tracked'],
          ['40%', 'less admin time'],
          ['100+', 'early members'],
          ['12+', 'job sources']
        ].map(([value, label]) => (
          <div
            className="border-[4px] border-black bg-white p-6 text-center shadow-[6px_6px_0_#000]"
            key={label}
          >
            <div className="text-[46px] font-black text-[#f97316]">{value}</div>
            <div className="text-[12px] font-black uppercase text-[#555]">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-[4px] border-black bg-[#09090b] p-8 text-white shadow-[8px_8px_0_#000] md:p-12">
        <div className="mb-5 flex gap-1 text-[#f9d44a]">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star className="h-5 w-5 fill-current" key={index} />
          ))}
        </div>
        <p className="max-w-[820px] text-[clamp(24px,3.2vw,42px)] font-black uppercase leading-tight">
          "I used to track applications in a Google Sheet with 11 columns. Landed replaced all of
          it in an afternoon."
        </p>
        <div className="mt-7 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center border-[3px] border-black bg-[#5dd6e4] text-lg font-black text-black shadow-[4px_4px_0_#000]">
            A
          </div>
          <div>
            <div className="text-[14px] font-black uppercase">Arjun Sharma</div>
            <div className="text-[13px] font-bold text-white/60">Software engineer, 3 offers in 6 weeks</div>
          </div>
        </div>
      </div>
    </Reveal>
  </section>
);

export const CtaSection = () => {
  const navigate = useNavigate();

  return (
    <section className="brutal-grid px-5 pb-24 md:px-8">
      <Reveal className="mx-auto max-w-[1080px] border-[4px] border-black bg-[#f97316] px-6 py-16 text-center shadow-[10px_10px_0_#000] md:px-12">
        <h2 className="mx-auto max-w-[820px] text-[clamp(42px,7vw,86px)] font-black uppercase leading-none text-white">
          Ready to stop guessing?
        </h2>
        <p className="mx-auto mt-6 max-w-[560px] text-[18px] font-black leading-8 text-white/85">
          Start with a clean job-search system: every resume, every application, every next step.
        </p>
        <button
          className="group mt-9 inline-flex items-center gap-3 border-[3px] border-black bg-black px-8 py-4 text-[15px] font-black uppercase text-white shadow-[6px_6px_0_#fff] transition hover:-translate-y-1"
          type="button"
          onClick={() => navigate('/login?mode=register')}
        >
          Start for free
          <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
        </button>
        <p className="mt-4 text-[12px] font-black uppercase text-white/70">No credit card required</p>
      </Reveal>
    </section>
  );
};
