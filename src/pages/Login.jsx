import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authenticate, homeForRole } from '../utils/auth';

/** Authenticate a visitor and open the appropriate local workspace. */
export default function Login() {
  const [values, setValues] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = (event) => {
    event.preventDefault();
    try {
      const result = authenticate(values.username, values.password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      navigate(homeForRole(result.session.role), { replace: true });
    } catch {
      setError('Your session could not be saved. Check browser storage and try again.');
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 px-5 py-12">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl shadow-indigo-950/25 sm:p-10" aria-labelledby="login-heading">
        <Link to="/" className="mx-auto flex w-fit items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 5h14M5 10h14M5 15h9M5 20h9" strokeLinecap="round" /></svg></span>
          <span className="font-display text-2xl font-semibold text-slate-900">WriteSpace</span>
        </Link>
        <div className="mt-8 text-center">
          <h1 id="login-heading" className="font-display text-3xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in and settle back into your space.</p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={submit}>
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-semibold text-slate-700">Username</label>
            <input id="username" name="username" autoComplete="username" required aria-required="true" value={values.username} onChange={(event) => setValues({ ...values, username: event.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required aria-required="true" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
          </div>
          {error && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
          <button type="submit" className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">Log in</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">New to WriteSpace? <Link to="/register" className="font-bold text-indigo-700 hover:text-indigo-900">Create an account</Link></p>
        <p className="mt-5 rounded-lg bg-slate-50 p-3 text-center text-xs leading-5 text-slate-500">Demo administrator: <strong>admin</strong> / <strong>admin</strong>. This local demo stores credentials in your browser; do not use a real password.</p>
      </section>
    </main>
  );
}
