import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import StatCard from '../components/StatCard';
import { getAvatar } from '../components/Avatar';
import { getSession } from '../utils/storage';
import { getDashboardStats, recentPosts } from '../utils/admin';
import { deletePost } from '../utils/posts';

/** Show administrator metrics and controls for the latest five posts. */
export default function AdminDashboard() {
  const session = getSession();
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const stats = getDashboardStats();
  const posts = recentPosts();

  const remove = (post) => {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    const result = deletePost(post.id, session);
    if (result.ok) setRevision((value) => value + 1);
    else setError(result.error);
  };

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-9 text-white shadow-lg shadow-indigo-900/15 sm:px-10 sm:py-11">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">Your community at a glance</p>
        <div className="mt-3 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div><h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Admin dashboard</h1><p className="mt-3 max-w-xl leading-7 text-white/85">A quick view of the posts and people making this local space.</p></div>
          <div className="flex flex-wrap gap-3"><Link to="/write" className="rounded-full bg-white px-5 py-2.5 font-bold text-indigo-700 hover:bg-indigo-50">Write new post</Link><Link to="/users" className="rounded-full border border-white/50 px-5 py-2.5 font-bold text-white hover:bg-white/10">Manage users</Link></div>
        </div>
      </section>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Community statistics">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </section>
      <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="recent-posts-heading">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Recently shared</p><h2 id="recent-posts-heading" className="mt-2 font-display text-3xl font-semibold text-slate-900">Recent posts</h2></div>
          <Link to="/blogs" className="text-sm font-bold text-indigo-700 hover:text-indigo-900">View all posts <span aria-hidden="true">→</span></Link>
        </div>
        {error && <p role="alert" className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
        {posts.length === 0 ? <p className="mt-6 rounded-xl bg-slate-50 px-5 py-9 text-center text-slate-600">No posts yet — the first story is waiting to be written.</p> : (
          <div className="mt-6 divide-y divide-slate-100">
            {posts.map((post) => <article key={`${post.id}-${revision}`} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1"><Link to={`/blog/${encodeURIComponent(post.id)}`} className="font-semibold text-slate-900 hover:text-indigo-700">{post.title}</Link><div className="mt-1 flex items-center gap-2 text-xs text-slate-500">{getAvatar(post.authorId === 'writespace-default-admin' ? 'admin' : 'user', 'sm')}<span>{post.authorName}</span><span aria-hidden="true">·</span><time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</time></div></div>
              <div className="flex gap-2"><Link to={`/edit/${encodeURIComponent(post.id)}`} className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50">Edit</Link><button type="button" onClick={() => remove(post)} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100">Delete</button></div>
            </article>)}
          </div>
        )}
      </section>
    </main>
  );
}
