import { jobBoards } from './landingData';

export const MarqueeSection = () => (
  <section className="brutal-grid px-5 pb-20 md:px-8">
    <div className="mx-auto max-w-[1060px]">
      <div className="relative -mt-2 mb-12 flex justify-center">
        <h2 className="-rotate-1 border-[3px] border-black bg-[#5dd6e4] px-6 py-3 text-center text-[22px] font-black uppercase shadow-[6px_6px_0_#000]">
          Supported job sources
        </h2>
      </div>
      <div className="overflow-hidden border-[4px] border-black bg-white py-10 shadow-[8px_8px_0_#000] [mask-image:linear-gradient(90deg,transparent_0%,#000_8%,#000_92%,transparent_100%)]">
        <div className="flex w-max items-center animate-[mq-rtl_26s_linear_infinite] hover:[animation-play-state:paused]">
          {[...jobBoards, ...jobBoards].map((name, index) => (
            <div className="flex shrink-0 items-center px-12" key={`${name}-${index}`}>
              <span className="whitespace-nowrap text-[24px] font-black text-[#b9b3a8] transition hover:text-black">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
