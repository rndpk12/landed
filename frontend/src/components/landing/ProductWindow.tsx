import { applications } from './landingData';
import { Reveal } from './Reveal';

const navItems = ['Applications', 'Resume vault', 'Diff viewer', 'Link parser', 'Settings'];

export const ProductWindow = () => (
  <section className="relative px-5 pb-[120px] md:px-11" id="product">
    <div className="mx-auto max-w-[1100px]">
      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-[#ebebeb] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 border-b border-[#ebebeb] bg-[#fafafa] px-[18px] py-[13px]">
            <span className="h-[11px] w-[11px] rounded-full bg-[#ff5f57]" />
            <span className="h-[11px] w-[11px] rounded-full bg-[#febc2e]" />
            <span className="h-[11px] w-[11px] rounded-full bg-[#28c840]" />
            <div className="ml-2.5 max-w-[300px] flex-1 rounded-md bg-[#f5f5f5] px-3.5 py-1 text-center text-xs text-[#9a9a9a]">
              app.landed.so - My Applications
            </div>
          </div>
          <div className="grid min-h-[420px] grid-cols-1 md:grid-cols-[210px_1fr]">
            <aside className="flex flex-row gap-1 overflow-x-auto border-b border-[#ebebeb] px-2 py-3 md:flex-col md:border-b-0 md:border-r md:px-0">
              {navItems.map((item, index) => (
                <div
                  className={`mx-1 flex shrink-0 cursor-pointer items-center gap-2 rounded-[7px] px-3.5 py-[7px] text-xs transition ${
                    index === 0
                      ? 'bg-[rgba(249,115,22,0.08)] text-[#f97316]'
                      : 'text-[#9a9a9a] hover:bg-[#f5f5f5] hover:text-[#4a4a4a]'
                  } ${index === 4 ? 'md:mt-2 md:border-t md:border-[#ebebeb] md:pt-4' : ''}`}
                  key={item}
                >
                  <span className="text-[10px]">{['[ ]', 'DOC', '<>', 'URL', '⚙'][index]}</span>
                  {item}
                </div>
              ))}
            </aside>
            <main className="flex flex-col gap-3 p-4 md:p-[22px]">
              <div className="mb-1 flex items-center justify-between">
                <div className="text-[13px] font-semibold text-[#0a0a0a]">Applications - Q2 2026</div>
                <button
                  className="rounded-md border border-[rgba(249,115,22,0.18)] bg-[rgba(249,115,22,0.08)] px-2.5 py-1 text-[11px] font-medium text-[#f97316]"
                  type="button"
                >
                  + Add application
                </button>
              </div>
              {applications.map((app) => (
                <div
                  className={`flex cursor-pointer flex-col justify-between gap-3 rounded-[10px] border p-4 transition hover:border-[#d4d4d4] hover:bg-white hover:shadow-[0_2px_10px_rgba(0,0,0,0.06)] sm:flex-row sm:items-center ${
                    app.highlight
                      ? 'border-[rgba(249,115,22,0.25)] bg-[rgba(249,115,22,0.03)]'
                      : 'border-[#ebebeb] bg-[#fafafa]'
                  }`}
                  key={`${app.company}-${app.role}`}
                >
                  <div className="flex flex-col gap-[3px]">
                    <div className="text-[13px] font-medium text-[#0a0a0a]">
                      {app.company} - {app.role}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#9a9a9a]">
                      {app.details.map((detail, index) => (
                        <span className="contents" key={detail}>
                          {index > 0 ? <span className="h-[3px] w-[3px] rounded-full bg-[#9a9a9a]" /> : null}
                          {detail}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#f5f5f5] px-[7px] py-0.5 text-[10px] font-medium text-[#9a9a9a]">
                      {app.version}
                    </span>
                    <span className={`rounded-full px-[9px] py-[3px] text-[10px] font-semibold ${app.badgeClass}`}>
                      {app.badge}
                    </span>
                  </div>
                </div>
              ))}
            </main>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);
