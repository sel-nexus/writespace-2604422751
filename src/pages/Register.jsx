import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerAccount } from '../utils/auth';

/** Collect a valid browser-local reader account. */
export default function Register() {
  const [values, setValues] = useState({ displayName: '', username: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const update = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
    setErrors({});
  };

  const submit = (event) => {
    event.preventDefault();
    const result = registerAccount(values);
    if (!result.ok) {
      setErrors({ [result.field]: result.error });
      return;
    }
    navigate('/blogs', { replace: true });
  };

  const fields = [
    { id: 'displayName', label: 'Display Name', type: 'text', autoComplete: 'name' },
    { id: 'username', label: 'Username', type: 'text', autoComplete: 'username' },
    { id: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
    { id: 'confirmPassword', label: 'Confirm Password', type: 'password', autoComplete: 'new-password' },
  ];

  return (
    <main className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 px-5 py-12">
      <section className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl shadow-indigo-950/25 sm:p-10" aria-labelledby="register-heading">
        <Link to="/" className="mx-auto flex w-fit items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 5h14M5 10h14M5 15h9M5 20h9" strokeLinecap="round" /></svg></span>
          <span className="font-display text-2xl font-semibold text-slate-900">WriteSpace</span>
        </Link>
        <div className="mt-8 text-center">
          <h1 id="register-heading" className="font-display text-3xl font-semibold text-slate-900">Make a little room</h1>
          <p className="mt-2 text-sm text-slate-500">Create your space and start writing.</p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={submit} noValidate>
          {fields.map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="mb-2 block text-sm font-semibold text-slate-700">{field.label}</label>
              <input id={field.id} name={field.id} type={field.type} autoComplete={field.autoComplete} required aria-required="true" aria-invalid={Boolean(errors[field.id])} aria-describedby={errors[field.id] ? `${field.id}-error` : undefined} value={values[field.id]} onChange={update} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
              {errors[field.id] && <p id={`${field.id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-rose-700">{errors[field.id]}</p>}
            </div>
          ))}
          {errors.form && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{errors.form}</p>}
          <button type="submit" className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">Create account</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="font-bold text-indigo-700 hover:text-indigo-900">Log in</Link></p>
        <p className="mt-4 text-center text-xs leading-5 text-slate-500">This local demo saves account details in this browser only. Don’t use real or sensitive credentials.</p>
      </section>
    </main>
  );
}
