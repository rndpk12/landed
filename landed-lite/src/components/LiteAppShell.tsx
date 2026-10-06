import { BriefcaseBusiness, FileText, LayoutDashboard, Link2, Settings2, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';

const links = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/import', label: 'Import URL', icon: Link2 },
  { to: '/applications', label: 'Applications', icon: BriefcaseBusiness },
  { to: '/resumes', label: 'Resume Vault', icon: FileText },
  { to: '/ats', label: 'ATS Match', icon: Sparkles },
  { to: '/settings', label: 'Settings', icon: Settings2 }
];

export const LiteAppShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-[#fbf7ef] text-black">
    <header className="border-b-[3px] border-black bg-[#fffaf1] px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <NavLink aria-label="Landed Lite home" to="/"><BrandLogo className="h-8 w-auto sm:h-9" /></NavLink>
        <span className="border-2 border-black bg-[#5dd6e4] px-2 py-1 text-[10px] font-black uppercase">Lite · local only</span>
      </div>
    </header>
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:py-7">
      <aside className="border-[3px] border-black bg-white p-2 shadow-[4px_4px_0_#000] lg:w-56 lg:self-start">
        <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              className={({ isActive }) => `flex items-center gap-2 border-2 border-black px-3 py-2.5 text-xs font-black uppercase no-underline transition ${isActive ? 'bg-[#f97316] text-white' : 'bg-white text-black hover:bg-[#f9d44a]'}`}
              end={end}
              key={label}
              to={to}
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <p className="hidden border-t-2 border-black px-2 pt-3 text-xs font-bold leading-5 text-[#666] lg:block">Saved only in this browser. Export a backup before changing devices.</p>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  </div>
);
