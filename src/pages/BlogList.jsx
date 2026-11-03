import { Link } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import { getSession, getPosts } from '../utils/storage';
import { listPosts } from '../utils/posts';

/** Show authenticated readers the complete local blog collection. */
export default function BlogList() {
  const session = getSession();
  const posts = listPosts(getPosts());
  return (
    <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">A space for every point of view</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">The community blog</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">Thoughts, notes, and small discoveries shared by the WriteSpace community.</p>
        </div>
        <Link to="/write" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 font-bold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"><span aria-hidden="true">＋</span> Write a post</Link>
      </div>
      {posts.length === 0 ? (
        <section className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center" aria-labelledby="empty-blogs">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700"><svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 4.5h10a4 4 0 0 1 4 4V20H9a4 4 0 0 1-4-4V4.5Z" strokeLinejoin="round" /><path d="M9 9h6M9 13h6" strokeLinecap="round" /></svg></span>
          <h2 id="empty-blogs" className="mt-5 font-display text-2xl font-semibold text-slate-900">No blogs yet. Be the first to write one!</h2>
          <p className="mt-2 text-slate-600">Your first post can make someone else’s day.</p>
          <Link to="/write" className="mt-6 inline-flex rounded-full bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700">Start writing</Link>
        </section>
      ) : (
        <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-label="Blog posts">
          {posts.map((post, index) => <BlogCard key={post.id} post={post} index={index} session={session} />)}
        </section>
      )}
    </main>
  );
}
