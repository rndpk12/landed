import { ArrowRight, Check, X } from 'lucide-react';
import { Reveal } from './Reveal';

const withoutItems = ['Search folders', 'Update spreadsheet', 'Guess resume version', 'Forget follow-ups'];
const withItems = ['Import job link', 'Attach resume version', 'Move stages', 'Review analytics'];

export const StorySection = () => (
  <section className="brutal-grid px-5 pb-24 md:px-8">
    <Reveal className="mx-auto max-w-[1080px] border-[4px] border-black bg-[#09090b] px-5 py-14 text-white shadow-[10px_10px_0_#000] md:px-12">
      <h2 className="mx-auto mb-12 max-w-[860px] text-center text-[clamp(34px,5vw,60px)] font-black uppercase leading-[1.02]">
        Save hours on every application
      </h2>

      <div className="grid items-stretch gap-8 lg:grid-cols-[1fr_auto_1fr]">
        <ComparisonCard
          badge="Without Landed"
          time="40 minutes"
          tone="bad"
          title="Apply to 10 jobs"
          items={withoutItems}
        />
        <div className="hidden items-center justify-center lg:flex">
          <span className="grid h-16 w-16 place-items-center rounded-full border-[4px] border-black bg-[#f97316] text-white shadow-[5px_5px_0_#000]">
            <ArrowRight className="h-8 w-8" />
          </span>
        </div>
        <ComparisonCard
          badge="With Landed"
          time="4 minutes"
          tone="good"
          title="Apply to 10 jobs"
          items={withItems}
        />
      </div>
    </Reveal>
  </section>
);

type ComparisonCardProps = {
  badge: string;
  time: string;
  tone: 'bad' | 'good';
  title: string;
  items: string[];
};

const ComparisonCard = ({ badge, time, tone, title, items }: ComparisonCardProps) => {
  const Icon = tone === 'good' ? Check : X;

  return (
    <div className="border-[4px] border-black bg-[#fffaf1] p-6 text-black shadow-[7px_7px_0_#000]">
      <div
        className={`mb-7 inline-block border-2 border-black px-3 py-1 text-[12px] font-black uppercase ${
          tone === 'good' ? 'bg-[#f97316] text-white' : 'bg-[#ece8df] text-[#6b7280]'
        }`}
      >
        {badge}
      </div>
      <p className="text-[17px] font-black">{title}</p>
      <div className={`mb-6 text-[42px] font-black ${tone === 'good' ? 'text-[#f97316]' : 'text-[#ef4444]'}`}>
        {time}
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li className="flex items-center gap-3 text-[15px] font-black text-[#4d4d4d]" key={item}>
            <span
              className={`grid h-7 w-7 place-items-center border-2 border-black ${
                tone === 'good' ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#fee2e2] text-[#dc2626]'
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};
