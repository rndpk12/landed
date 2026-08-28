import { ChevronDown, Check } from 'lucide-react';
import { faqs, features, steps } from './landingData';
import { Reveal } from './Reveal';

export const HowItWorksSection = () => (
  <section className="brutal-grid px-5 pb-24 md:px-8">
    <div className="mx-auto max-w-[1120px]">
      <Reveal className="mb-12 text-center">
        <h2 className="text-[clamp(36px,6vw,72px)] font-black uppercase leading-none">
          How Landed works
        </h2>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <Reveal delay={index === 1 ? 'd1' : index === 2 ? 'd2' : undefined} key={step.title}>
            <div className="h-full border-[4px] border-black bg-white p-6 shadow-[7px_7px_0_#000] transition hover:-translate-y-1 hover:shadow-[10px_10px_0_#000]">
              <div className="mb-10 grid h-16 w-16 place-items-center border-[3px] border-black bg-[#f97316] text-[30px] font-black text-white shadow-[4px_4px_0_#000]">
                {step.number}
              </div>
              <h3 className="mb-3 text-[26px] font-black uppercase leading-tight">{step.title}</h3>
              <p className="text-[15px] font-bold leading-7 text-[#555]">{step.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export const FeaturesSection = () => (
  <section className="brutal-grid px-5 pb-24 md:px-8" id="features">
    <div className="mx-auto max-w-[1120px]">
      <Reveal className="mb-10 grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-end">
        <div>
          <div className="mb-4 inline-block border-2 border-black bg-[#f9d44a] px-3 py-1 text-[12px] font-black uppercase shadow-[3px_3px_0_#000]">
            Feature stack
          </div>
          <h2 className="text-[clamp(38px,6vw,74px)] font-black uppercase leading-none">
            Everything your job search needs.
          </h2>
        </div>
        <p className="max-w-[520px] text-[17px] font-bold leading-8 text-[#4d4d4d]">
          The reference-style flash, but for Landed's real workflow: profile data, resumes,
          applications, notes, and analytics all moving together.
        </p>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map(({ title, body, icon: Icon, color }, index) => (
          <Reveal
            delay={index % 3 === 1 ? 'd1' : index % 3 === 2 ? 'd2' : undefined}
            key={title}
          >
            <div className="group min-h-[250px] border-[4px] border-black bg-white p-6 shadow-[7px_7px_0_#000] transition hover:-translate-y-1 hover:shadow-[10px_10px_0_#000]">
              <div
                className={`mb-9 grid h-14 w-14 place-items-center border-[3px] border-black ${color} text-black shadow-[4px_4px_0_#000] transition group-hover:rotate-3`}
              >
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-[24px] font-black uppercase leading-tight">{title}</h3>
              <p className="text-[14px] font-bold leading-7 text-[#555]">{body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export const PricingFaqSection = () => (
  <>
    <section className="brutal-grid px-5 pb-24 md:px-8" id="pricing">
      <div className="mx-auto max-w-[1080px]">
        <Reveal className="mb-10 text-center">
          <div className="mb-4 inline-block border-2 border-black bg-[#f5b8d4] px-3 py-1 text-[12px] font-black uppercase shadow-[3px_3px_0_#000]">
            Simple pricing
          </div>
          <h2 className="text-[clamp(36px,6vw,70px)] font-black uppercase leading-none">
            No messy tiers.
          </h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          <PriceCard
            cta="Start free"
            name="Free"
            price="$0"
            points={['Resume vault', 'Application tracker', 'Job import', 'Interview notes']}
          />
          <PriceCard
            highlighted
            cta="Go pro"
            name="Pro"
            price="$9"
            points={['Everything in Free', 'Advanced analytics', 'Resume performance', 'Priority updates']}
          />
        </div>
      </div>
    </section>

    <section className="brutal-grid px-5 pb-24 md:px-8" id="faq">
      <Reveal className="mx-auto max-w-[900px]">
        <h2 className="mb-8 text-center text-[clamp(34px,5vw,60px)] font-black uppercase leading-none">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              className="group border-[3px] border-black bg-white p-5 shadow-[5px_5px_0_#000]"
              key={faq.question}
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[18px] font-black uppercase">
                {faq.question}
                <ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-[15px] font-bold leading-7 text-[#555]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Reveal>
    </section>
  </>
);

type PriceCardProps = {
  cta: string;
  highlighted?: boolean;
  name: string;
  points: string[];
  price: string;
};

const PriceCard = ({ cta, highlighted, name, points, price }: PriceCardProps) => (
  <Reveal>
    <div
      className={`relative h-full border-[4px] border-black p-7 shadow-[8px_8px_0_#000] ${
        highlighted ? 'bg-[#f97316] text-white' : 'bg-white text-black'
      }`}
    >
      {highlighted ? (
        <div className="absolute -top-5 right-6 rotate-2 border-[3px] border-black bg-[#f9d44a] px-3 py-1 text-[12px] font-black uppercase text-black shadow-[4px_4px_0_#000]">
          Popular
        </div>
      ) : null}
      <h3 className="text-[30px] font-black uppercase">{name}</h3>
      <div className="mb-7 mt-4 flex items-end gap-2">
        <span className="text-[64px] font-black leading-none">{price}</span>
        <span className="pb-2 text-[15px] font-black uppercase opacity-70">/month</span>
      </div>
      <ul className="mb-8 space-y-3">
        {points.map((point) => (
          <li className="flex items-center gap-3 text-[15px] font-black" key={point}>
            <span className="grid h-6 w-6 place-items-center border-2 border-black bg-[#dcfce7] text-[#16a34a]">
              <Check className="h-4 w-4" />
            </span>
            {point}
          </li>
        ))}
      </ul>
      <button
        className={`w-full border-[3px] border-black px-5 py-3 text-[14px] font-black uppercase shadow-[5px_5px_0_#000] transition hover:-translate-y-0.5 ${
          highlighted ? 'bg-black text-white' : 'bg-[#f97316] text-white'
        }`}
        type="button"
      >
        {cta}
      </button>
    </div>
  </Reveal>
);
