import { useNavigate } from 'react-router-dom';

const columns = [
  ['Product', 'Resume vault', 'Application tracker', 'Diff viewer', 'Job import'],
  ['Resources', 'How it works', 'Pricing', 'FAQ', 'Support'],
  ['Company', 'About', 'Blog', 'Careers', 'Contact']
];

export const LandingFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="brutal-grid border-t-[3px] border-black bg-[#fffaf1] px-5 pt-14 md:px-8">
      <div className="mx-auto grid max-w-[1080px] gap-10 md:grid-cols-[1.35fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center border-[3px] border-black bg-[#f97316] font-black text-white shadow-[4px_4px_0_#000]">
              L
            </span>
            <span className="text-[22px] font-black italic">LANDED</span>
          </div>
          <p className="mb-5 max-w-[260px] text-[14px] font-bold leading-7 text-[#555]">
            Version control for your job search. One place for every resume, application, and offer.
          </p>
          <button
            className="border-[3px] border-black bg-black px-4 py-2 text-[12px] font-black uppercase text-white shadow-[4px_4px_0_#f97316] transition hover:-translate-y-0.5"
            type="button"
            onClick={() => navigate('/login?mode=register')}
          >
            Get started
          </button>
        </div>
        {columns.map(([label, ...links]) => (
          <div key={label}>
            <div className="mb-4 text-[12px] font-black uppercase text-black">{label}</div>
            <ul className="flex list-none flex-col gap-3">
              {links.map((link) => (
                <li key={link}>
                  <a className="text-[13px] font-bold text-[#555] no-underline transition hover:text-[#f97316]" href="#">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-14 flex max-w-[1080px] items-center justify-center border-y-[3px] border-black py-8">
        <div className="select-none whitespace-nowrap text-[clamp(88px,24vw,300px)] font-black uppercase leading-[0.82] text-black">
          Landed
        </div>
      </div>
      <div className="mx-auto flex max-w-[1080px] flex-col gap-3 py-5 text-[12px] font-bold text-[#555] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-5">
          {['Terms', 'Privacy', 'Security'].map((item) => (
            <a className="text-[#555] no-underline transition hover:text-black" href="#" key={item}>
              {item}
            </a>
          ))}
        </div>
        <div>© 2026 Landed, Inc. All rights reserved.</div>
      </div>
    </footer>
  );
};
