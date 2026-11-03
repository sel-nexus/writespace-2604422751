import PropTypes from 'prop-types';

/** Render the role-specific WriteSpace mark. */
export function getAvatar(role, size = 'md') {
  const isAdmin = role === 'admin';
  const sizes = { sm: 'h-8 w-8 text-sm', md: 'h-10 w-10 text-base', lg: 'h-14 w-14 text-xl' };
  const Icon = isAdmin ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m4 8 4 4 4-7 4 7 4-4-2 10H6L4 8Z" strokeLinejoin="round" />
      <path d="M7 21h10" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 4.5h10a4 4 0 0 1 4 4V20H9a4 4 0 0 1-4-4V4.5Z" strokeLinejoin="round" />
      <path d="M9 8h6M9 12h6M9 16h3" strokeLinecap="round" />
    </svg>
  );
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full text-white ${sizes[size] || sizes.md} ${isAdmin ? 'bg-violet-600' : 'bg-indigo-500'}`} aria-label={`${isAdmin ? 'Admin' : 'User'} avatar`}>
      {Icon}
    </span>
  );
}

getAvatar.propTypes = { role: PropTypes.string.isRequired, size: PropTypes.string };
