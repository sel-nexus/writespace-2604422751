import { useState } from 'react';
import UserRow from '../components/UserRow';
import { getSession } from '../utils/storage';
import { addManagedUser, deleteManagedUser, listManagedUsers } from '../utils/admin';

/** Let administrators create and manage browser-local user accounts. */
export default function UserManagement() {
  const session = getSession();
  const [values, setValues] = useState({ displayName: '', username: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const users = listManagedUsers();

  const update = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
    setNotice('');
  };

  const submit = (event) => {
    event.preventDefault();
    const result = addManagedUser(values);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setValues({ displayName: '', username: '', password: '', role: 'user' });
    setNotice(`${result.user.displayName} was added as ${result.user.role === 'admin' ? 'an administrator' : 'a user'}.`);
    setRevision((value) => value + 1);
  };

  const remove = (user) => {
    if (!window.confirm(`Delete the account for ${user.displayName}?`)) return;
    const result = deleteManagedUser(user.id, session.userId);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice(`${user.displayName} was removed.`);
    setRevision((value) => value + 1);
  };

  const fieldClass = 'w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';
  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">Administrator tools</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">People in your space</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">Create local demo accounts and keep the community list tidy.</p>
      </div>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="create-user-heading">
        <h2 id="create-user-heading" className="font-display text-2xl font-semibold text-slate-900">Create user</h2>
        <p className="mt-2 text-sm text-slate-600">Accounts are stored in this browser profile for the demo.</p>
        <form className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={submit} noValidate>
          <div><label htmlFor="managed-display-name" className="mb-2 block text-sm font-semibold text-slate-700">Display Name</label><input id="managed-display-name" name="displayName" required aria-required="true" value={values.displayName} onChange={update} className={fieldClass} /></div>
          <div><label htmlFor="managed-username" className="mb-2 block text-sm font-semibold text-slate-700">Username</label><input id="managed-username" name="username" autoComplete="off" required aria-required="true" value={values.username} onChange={update} className={fieldClass} /></div>
          <div><label htmlFor="managed-password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label><input id="managed-password" name="password" type="password" autoComplete="new-password" required aria-required="true" value={values.password} onChange={update} className={fieldClass} /></div>
          <div><label htmlFor="managed-role" className="mb-2 block text-sm font-semibold text-slate-700">Role</label><select id="managed-role" name="role" value={values.role} onChange={update} className={fieldClass}><option value="user">User</option><option value="admin">Admin</option></select></div>
          <div className="sm:col-span-2 lg:col-span-4">
            {error && <p role="alert" className="mb-3 rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
            {notice && <p role="status" className="mb-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p>}
            <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">Create account</button>
          </div>
        </form>
      </section>
      <section className="mt-9" aria-labelledby="user-list-heading">
        <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Local accounts</p><h2 id="user-list-heading" className="mt-2 font-display text-2xl font-semibold text-slate-900">Users <span className="text-base font-medium text-slate-500">({users.length})</span></h2></div></div>
        <div key={revision}>
          <div className="space-y-3 sm:hidden">
            {users.map((user) => <UserRow key={user.id} variant="mobile" user={user} currentUserId={session.userId} defaultAdmin={user.id === 'writespace-default-admin'} onDelete={remove} />)}
          </div>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500"><tr><th scope="col" className="px-5 py-3">Account</th><th scope="col" className="px-5 py-3">Username</th><th scope="col" className="px-5 py-3">Role</th><th scope="col" className="px-5 py-3">Created</th><th scope="col" className="px-5 py-3 text-right">Action</th></tr></thead>
              <tbody>{users.map((user) => <UserRow key={user.id} user={user} currentUserId={session.userId} defaultAdmin={user.id === 'writespace-default-admin'} onDelete={remove} />)}</tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
