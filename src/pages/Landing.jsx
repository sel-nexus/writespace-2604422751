import { Link } from 'react-router-dom';
import { getPosts, getSession } from '../utils/storage';

const features = [
  { number: '01', title: 'Write freely', text: 'A quiet, plain-text canvas for ideas before they are ready for anywhere else.', tone: 'bg-indigo-50 text-indigo-700' },
  { number: '02', title: 'Private & local', text: 'Your writing stays in this browser. No server, feed algorithm, or account service.', tone: 'bg-violet-50 text-violet-700' },
  { number: '03', title: 'Instant & fast', text: 'Open your space and get straight to the words. Your data is close at hand.', tone: 'bg-pink-50 text-pink-700' },
];

/** Present WriteSpace to visitors and surface recent community posts. */
export default function Landing() {
  const session = getSession();
  const latest = [...getPosts()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  const readingPath = session ? '/blogs' : '/login';

  return (
    <>
      <main>
        <section className="relative isolate flex min-h-[calc(100vh-65px)] overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 text-white">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-20" aria-hidden="true">
            <div className="absolute -right-24 top-12 h-96 w-96 rounded-full bg-pink-200 blur-3xl" />
            <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-indigo-950 blur-3xl" />
          </div>
          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
            <div className="max-w-2xl">
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide text-white/95 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-pink-200" />
                YOUR QUIET CORNER OF THE INTERNET
              </p>
              <h1 className="font-display text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">Your thoughts.<br />Your space.<br /><span className="text-pink-100">Beautifully simple.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-white/85 sm:text-xl">A little room to put your ideas into words, share them with a thoughtful community, and find your way back to what matters.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to={readingPath} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-bold text-indigo-700 shadow-lg shadow-indigo-950/15 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-violet-700">
                  Start reading <span aria-hidden="true">→</span>
                </Link>
                <Link to="/register" className="inline-flex items-center justify-center rounded-full border border-white/50 bg-white/10 px-6 py-3.5 text-base font-bold text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Get started free</Link>
              </div>
              <p className="mt-6 text-sm text-white/75">A browser-local demo. Please don’t use real passwords or sensitive information.</p>
            </div>
            <div className="relative hidden h-[430px] items-center justify-center lg:flex" aria-hidden="true">
              <div className="absolute left-8 top-8 h-72 w-72 rounded-full border border-white/15" />
              <div className="absolute left-16 top-16 h-56 w-56 rounded-full border border-white/15" />
              <article className="animate-float-soft relative w-[320px] rotate-2 rounded-3xl bg-white p-7 text-slate-800 shadow-2xl shadow-indigo-950/30">
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">A small note</span>
                  <span className="text-xs text-slate-400">4 min read</span>
                </div>
                <h2 className="font-display text-3xl font-semibold leading-tight">The art of noticing</h2>
                <p className="mt-4 text-sm leading-6 text-slate-500">Some days the best thing we can do is pay attention to the ordinary things that keep showing up...</p>
                <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-700">M</span>
                  <div><p className="text-sm font-semibold">Mara Ellis</p><p className="text-xs text-slate-400">Yesterday</p></div>
                  <span className="ml-auto rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Notes</span>
                </div>
              </article>
              <div className="absolute bottom-10 right-0 rounded-2xl border border-white/30 bg-white/15 px-5 py-4 text-sm font-semibold text-white shadow-lg backdrop-blur">✦ &nbsp; Make room for a thought</div>
            </div>
          </div>
          <a href="#features" aria-label="Scroll to features" className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 text-white/75 hover:text-white lg:block">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">A space for what you think</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Less noise.<br />More words that matter.</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.number} className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-card-soft">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold ${feature.tone}`}>{feature.number}</span>
                <h3 className="mt-6 font-display text-2xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">From the community</p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-900">Latest from the Blog</h2>
              </div>
              {latest.length > 0 && <Link to={readingPath} className="font-semibold text-indigo-700 hover:text-indigo-900">All stories <span aria-hidden="true">→</span></Link>}
            </div>
            {latest.length === 0 ? (
              <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-600">No posts yet — check back soon!</p>
            ) : (
              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {latest.map((post, index) => (
                  <Link key={post.id} to={`/blog/${encodeURIComponent(post.id)}`} className={`group rounded-2xl border border-slate-200 border-t-4 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-card-soft ${['border-t-indigo-500', 'border-t-violet-500', 'border-t-pink-500'][index]}`}>
                    <p className="text-xs font-medium text-slate-500">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</p>
                    <h3 className="mt-4 font-display text-2xl font-semibold text-slate-900 group-hover:text-indigo-700">{post.title}</h3>
                    <p className="mt-3 line-clamp-3 leading-6 text-slate-600">{String(post.content || '').slice(0, 120)}</p>
                    <p className="mt-6 text-sm font-semibold text-slate-700">{post.authorName}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <footer className="bg-slate-900 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p className="text-sm">© {new Date().getFullYear()} WriteSpace. A little room to think.</p>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link to="/" className="hover:text-white">Home</Link><Link to={readingPath} className="hover:text-white">All Blogs</Link><Link to="/login" className="hover:text-white">Login</Link><Link to="/register" className="hover:text-white">Register</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
