import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAvatar } from '../components/Avatar';
import { getSession, getPosts } from '../utils/storage';
import { canManagePost, deletePost } from '../utils/posts';
import { useState } from 'react';

/** Read one post and expose permitted edit/delete operations. */
export default function BlogDetail() {
  const { id } = useParams();
  const decodedId = decodeURIComponent(id || '');
  const session = getSession();
  const post = getPosts().find((entry) => entry.id === decodedId);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  if (!post) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="font-display text-3xl font-semibold text-slate-900">Post not found</h1>
          <p className="mt-3 text-slate-600">This post may have been removed or the link may be out of date.</p>
          <Link to="/blogs" className="mt-6 inline-flex rounded-full bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700">Back to all posts</Link>
        </section>
      </main>
    );
  }

  const mayManage = canManagePost(post, session);
  const removePost = () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    const result = deletePost(post.id, session);
    if (result.ok) navigate('/blogs', { replace: true });
    else setError(result.error);
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:py-16">
      <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700 hover:text-indigo-900"><span aria-hidden="true">←</span> Back to all posts</Link>
      <article className="mt-7 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10 lg:p-14">
        <p className="text-sm font-semibold text-slate-500">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">{post.title}</h1>
        <div className="mt-7 flex items-center gap-3 border-b border-slate-100 pb-7">
          {getAvatar(post.authorId === 'writespace-default-admin' ? 'admin' : 'user')}
          <div><p className="font-semibold text-slate-800">{post.authorName}</p><p className="text-sm text-slate-500">WriteSpace contributor</p></div>
        </div>
        <div className="prose prose-slate mt-8 max-w-none whitespace-pre-wrap text-base leading-8 text-slate-700">{post.content}</div>
        {error && <p role="alert" className="mt-7 rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
        {mayManage && <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">
          <Link to={`/edit/${encodeURIComponent(post.id)}`} className="inline-flex justify-center rounded-xl border border-indigo-200 px-5 py-2.5 font-semibold text-indigo-700 hover:bg-indigo-50">Edit post</Link>
          <button type="button" onClick={removePost} className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 font-semibold text-rose-700 hover:bg-rose-100">Delete post</button>
        </div>}
      </article>
    </main>
  );
}
