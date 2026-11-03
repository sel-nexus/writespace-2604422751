import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getSession, getPosts } from '../utils/storage';
import { createPost, updatePost } from '../utils/posts';

/** Create or edit a plain-text post with ownership checks and inline validation. */
export default function PostEditor({ editMode = false } = {}) {
  const { id } = useParams();
  const postId = decodeURIComponent(id || '');
  const session = getSession();
  const navigate = useNavigate();
  const [values, setValues] = useState({ title: '', content: '' });
  const [errors, setErrors] = useState({});
  const [ready, setReady] = useState(!editMode);

  useEffect(() => {
    if (!editMode) return;
    const post = getPosts().find((entry) => entry.id === postId);
    if (!post) {
      setErrors({ form: 'Post not found.' });
      setReady(true);
      return;
    }
    if (session.role !== 'admin' && post.authorId !== session.userId) {
      navigate('/blogs', { replace: true });
      return;
    }
    setValues({ title: post.title, content: post.content });
    setReady(true);
  }, [editMode, postId, session.role, session.userId, navigate]);

  const update = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors({});
  };

  const submit = (event) => {
    event.preventDefault();
    const result = editMode ? updatePost(postId, values, session) : createPost(values, session);
    if (!result.ok) {
      setErrors(result.field ? { [result.field]: result.error } : { form: result.error });
      return;
    }
    navigate(`/blog/${encodeURIComponent(result.post.id)}`, { replace: true });
  };

  if (!ready) return <main className="mx-auto max-w-3xl px-5 py-16" role="status">Loading post…</main>;
  if (editMode && errors.form === 'Post not found.') {
    return <main className="mx-auto max-w-3xl px-5 py-16"><section className="rounded-3xl border border-slate-200 bg-white p-10 text-center"><h1 className="font-display text-3xl font-semibold">Post not found</h1><p className="mt-3 text-slate-600">This post may have been removed.</p><Link to="/blogs" className="mt-6 inline-flex rounded-full bg-indigo-600 px-5 py-2.5 font-semibold text-white">Back to all posts</Link></section></main>;
  }

  const fieldClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';
  return (
    <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:py-16">
      <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700 hover:text-indigo-900"><span aria-hidden="true">←</span> Back to all posts</Link>
      <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10" aria-labelledby="editor-heading">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{editMode ? 'Polish your words' : 'Your writing space'}</p>
        <h1 id="editor-heading" className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-900">{editMode ? 'Edit your post' : 'Write a new post'}</h1>
        <p className="mt-3 text-slate-600">A title, a thought, and room to say it your way.</p>
        <form className="mt-8 space-y-6" onSubmit={submit} noValidate>
          <div>
            <label htmlFor="post-title" className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
            <input id="post-title" name="title" value={values.title} onChange={update} required aria-required="true" aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'title-error' : undefined} className={`${fieldClass} text-lg font-semibold`} placeholder="Give your thought a name" />
            {errors.title && <p id="title-error" role="alert" className="mt-2 text-sm font-medium text-rose-700">{errors.title}</p>}
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label htmlFor="post-content" className="text-sm font-semibold text-slate-700">Content</label>
              <span className="text-xs tabular-nums text-slate-500">{values.content.length} characters</span>
            </div>
            <textarea id="post-content" name="content" value={values.content} onChange={update} required aria-required="true" aria-invalid={Boolean(errors.content)} aria-describedby={errors.content ? 'content-error' : undefined} className={`${fieldClass} min-h-64 resize-y leading-7`} placeholder="Start wherever the thought begins…" />
            {errors.content && <p id="content-error" role="alert" className="mt-2 text-sm font-medium text-rose-700">{errors.content}</p>}
          </div>
          {errors.form && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{errors.form}</p>}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <Link to="/blogs" className="inline-flex justify-center rounded-xl px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Cancel</Link>
            <button type="submit" className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">{editMode ? 'Save changes' : 'Publish post'}</button>
          </div>
        </form>
      </section>
    </main>
  );
}


