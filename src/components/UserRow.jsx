import PropTypes from 'prop-types';
import { getAvatar } from './Avatar';

/** Render a browser-local account with safe deletion affordances. */
export default function UserRow({ user, currentUserId, defaultAdmin = false, onDelete, variant = 'table' }) {
  const isDefaultAdmin = defaultAdmin || user.id === 'writespace-default-admin';
  const isCurrentUser = user.id === currentUserId;
  const disabled = isDefaultAdmin || isCurrentUser;
  const tooltip = isDefaultAdmin ? 'Default admin cannot be deleted.' : isCurrentUser ? 'You cannot delete your own account.' : undefined;
  const roleTone = user.role === 'admin' ? 'bg-violet-100 text-violet-700 ring-violet-300' : 'bg-indigo-100 text-indigo-700 ring-indigo-300';

  if (variant === 'mobile') {
    return (
      <article className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {getAvatar(user.role)}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900">{user.displayName}</h2><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${roleTone}`}>{user.role === 'admin' ? 'Admin' : 'User'}</span></div>
          <p className="mt-1 text-sm text-slate-600">@{user.username}</p>
          <p className="mt-1 text-xs text-slate-500">Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</p>
          <button type="button" disabled={disabled} title={tooltip} aria-label={disabled ? `${tooltip} ${user.displayName}` : `Delete ${user.displayName}`} onClick={() => onDelete(user)} className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50">Delete account</button>
        </div>
      </article>
    );
  }

  return (
      <tr className="border-b border-slate-100 last:border-0">
        <td className="px-5 py-4"><div className="flex items-center gap-3">{getAvatar(user.role, 'sm')}<span className="font-semibold text-slate-800">{user.displayName}</span></div></td>
        <td className="px-5 py-4 text-slate-600">{user.username}</td>
        <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${roleTone}`}>{user.role === 'admin' ? 'Admin' : 'User'}</span></td>
        <td className="px-5 py-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
        <td className="px-5 py-4 text-right"><button type="button" disabled={disabled} title={tooltip} aria-label={disabled ? `${tooltip} ${user.displayName}` : `Delete ${user.displayName}`} onClick={() => onDelete(user)} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50">Delete</button></td>
      </tr>
  );
}

UserRow.propTypes = {
  user: PropTypes.shape({ id: PropTypes.string.isRequired, displayName: PropTypes.string.isRequired, username: PropTypes.string.isRequired, role: PropTypes.string.isRequired, createdAt: PropTypes.string.isRequired }).isRequired,
  currentUserId: PropTypes.string.isRequired,
  defaultAdmin: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['table', 'mobile']),
};

