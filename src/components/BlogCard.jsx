import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getAvatar } from './Avatar';
import { excerpt, canManagePost } from '../utils/posts';

const accents = ['border-indigo-500', 'border-violet-500', 'border-pink-500', 'border-teal-500'];

/** Present a post preview and only the actions allowed to this reader. */
export default function BlogCard({ post, index, session }) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  return (
    <article className={`overflow-hidden rounded-2xl border border-slate-200 border-t-4 bg-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-card-soft ${accents[index % accents.length]}`}>
      <Link to={`/blog/${encodeURIComponent(post.id)}`} className="block rounded-t-xl p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{formattedDate}</p>
        <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-slate-900">{post.title}</h2>
        <p className="mt-3 min-h-12 leading-6 text-slate-600">{excerpt(post.content)}</p>
      </Link>
      <div className="flex items-center gap-3 border-t border-slate-100 px-6 py-4">
        {getAvatar(post.authorId === 'writespace-default-admin' ? 'admin' : 'user', 'sm')}
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{post.authorName}</span>
        {canManagePost(post, session) && <Link to={`/edit/${encodeURIComponent(post.id)}`} aria-label={`Edit ${post.title}`} className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Edit</Link>}
      </div>
    </article>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({ id: PropTypes.string.isRequired, title: PropTypes.string.isRequired, content: PropTypes.string.isRequired, createdAt: PropTypes.string.isRequired, authorId: PropTypes.string.isRequired, authorName: PropTypes.string.isRequired }).isRequired,
  index: PropTypes.number.isRequired,
  session: PropTypes.shape({ userId: PropTypes.string.isRequired, role: PropTypes.string.isRequired }),
};
