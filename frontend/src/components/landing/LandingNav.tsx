import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LandingNav = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed left-0 right-0 top-0 z-[199] flex h-[68px] items-center justify-between border-b-[3px] border-black bg-[#fffaf1]/95 px-4 backdrop-blur md:px-8">
      <a className="group flex items-center gap-2 no-underline" href="#">
        <span className="grid h-10 w-10 place-items-center border-[3px] border-black bg-[#f97316] font-black text-white shadow-[4px_4px_0_#000] transition group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0_#000]">
          L
        </span>
        <span className="text-[22px] font-black italic text-black">LANDED</span>
      </a>
      <ul className="hidden list-none items-center gap-8 md:flex">
        {[
          ['Features', '#features'],
          ['Pricing', '#pricing'],
          ['FAQ', '#faq']
        ].map(([label, href]) => (
          <li key={label}>
            <a
              className="text-[13px] font-black uppercase tracking-[0.04em] text-black no-underline transition hover:text-[#f97316]"
              href={href}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2.5">
        <button
          className="hidden px-3 py-1.5 text-[13px] font-black uppercase text-black transition hover:text-[#f97316] sm:block"
          type="button"
          onClick={() => navigate('/login')}
        >
          Log in
        </button>
        <button
          className="inline-flex items-center gap-2 border-[3px] border-black bg-[#f97316] px-3 py-2 text-[12px] font-black uppercase text-white shadow-[4px_4px_0_#000] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] sm:px-4"
          type="button"
          onClick={() => navigate('/login?mode=register')}
        >
          Start
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
};
