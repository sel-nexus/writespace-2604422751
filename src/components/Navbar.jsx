import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getAvatar } from './Avatar';
import { clearSession, getSession } from '../utils/storage';

const adminLinks = [
  { to: '/blogs', label: 'All Blogs' },
  { to: '/write', label: 'Write' },
  { to: '/users', label: 'Users' },
];
const userLinks = [
  { to: '/blogs', label: 'All Blogs' },
  { to: '/write', label: 'Write' },
];

/** Render public calls to action or role-aware authenticated navigation. */
export default function Navbar() {
  const [session, setSession] = useState(() => getSession());
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const refresh = () => setSession(getSession());
    window.addEventListener('writespace:session', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('writespace:session', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const logout = () => {
    clearSession();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="WriteSpace home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 5h14M5 10h14M5 15h9M5 20h9" strokeLinecap="round" /></svg>
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-slate-900">WriteSpace</span>
        </Link>
        {session ? (
          <>
            <div className="hidden items-center gap-1 md:flex">
              {(session.role === 'admin' ? adminLinks : userLinks).map((link) => (
                <NavLink key={link.to} to={link.to} className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                  {link.label}
                </NavLink>
              ))}
            </div>
            <div className="relative flex items-center gap-3">
              {getAvatar(session.role, 'sm')}
              <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-haspopup="menu" className="hidden items-center gap-2 rounded-lg px-2 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:flex">
                <span className="max-w-32 truncate text-sm font-semibold text-slate-800">{session.displayName}</span>
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m5 7 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 md:hidden">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={menuOpen ? 'm6 6 12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'} strokeLinecap="round" /></svg>
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 top-12 z-50 min-w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-card-soft">
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{session.role === 'admin' ? 'Administrator' : 'Your space'}</p>
                  {(session.role === 'admin' ? adminLinks : userLinks).map((link) => <Link role="menuitem" key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">{link.label}</Link>)}
                  <button role="menuitem" type="button" onClick={logout} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50">Log out</button>
                </div>
              )}
              <button type="button" onClick={logout} className="hidden rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 sm:block">Log out</button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Log in</Link>
            <Link to="/register" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">Get started</Link>
          </div>
        )}
      </nav>
    </header>
  );
}
