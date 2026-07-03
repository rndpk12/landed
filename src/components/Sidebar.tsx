import { Link, NavLink } from 'react-router-dom';
import {
  BarChart3,
  BriefcaseBusiness,
  FileSearch,
  FileText,
  Home,
  LogOut,
  NotebookTabs,
  Settings
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Applications', path: '/applications', icon: BriefcaseBusiness },
  { label: 'Resume Vault', path: '/resumes', icon: FileText },
  { label: 'Resume Match', path: '/resume-match', icon: FileSearch },
  { label: 'Interview Notes', path: '/interview-notes', icon: NotebookTabs },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 }
];

export const Sidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { user, logout } = useAuth();

  return (
    <>
      <div
        className={'fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden ' + (open ? 'block' : 'hidden')}
        onClick={onClose}
      />
      <aside
        className={
          'fixed inset-y-0 left-0 z-40 flex h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r-[3px] border-black bg-[#fffaf1] transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 ' +
          (open ? 'translate-x-0' : '-translate-x-full')
        }
      >
        <div className="flex h-16 shrink-0 items-center border-b-[3px] border-black px-4">
          <Link to="/dashboard" className="flex items-center gap-2 no-underline">
            <span className="grid h-9 w-9 place-items-center border-[3px] border-black bg-[#f97316] text-sm font-black text-white shadow-[3px_3px_0_#000]">
              L
            </span>
            <span className="text-[20px] font-black italic text-black">LANDED</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-4">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                'flex items-center gap-3 border-[3px] border-black px-3 py-2.5 text-[13px] font-black uppercase shadow-[3px_3px_0_#000] transition hover:-translate-y-0.5 ' +
                (isActive ? 'bg-[#f97316] text-white' : 'bg-white text-black hover:bg-[#f9d44a]')
              }
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2.5 border-t-[3px] border-black px-3 py-4">
          <Link
            className="flex items-center gap-3 border-[3px] border-black bg-white px-3 py-2.5 text-[13px] font-black uppercase text-black shadow-[3px_3px_0_#000] transition hover:-translate-y-0.5 hover:bg-[#5dd6e4]"
            to="/settings"
          >
            <Settings className="h-[18px] w-[18px]" />
            Settings
          </Link>
          <div className="border-[3px] border-black bg-[#f8efe2] p-2.5">
            <p className="truncate text-[13px] font-black text-black">{user?.name ?? 'Landed User'}</p>
            <p className="truncate text-[11px] font-bold text-[#555]">{user?.email ?? 'user@landed.ai'}</p>
          </div>
          <button
            className="flex w-full items-center gap-3 border-[3px] border-black bg-black px-3 py-2.5 text-[13px] font-black uppercase text-white shadow-[3px_3px_0_#f97316] transition hover:-translate-y-0.5"
            type="button"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
