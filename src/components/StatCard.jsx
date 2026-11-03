import PropTypes from 'prop-types';

const accents = {
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  pink: 'bg-pink-50 text-pink-700 ring-pink-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  teal: 'bg-teal-50 text-teal-700 ring-teal-100',
};

/** Present one administrator dashboard metric with a clear label and count. */
export default function StatCard({ label, value, accent = 'indigo' }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-4xl font-bold tracking-tight tabular-nums text-slate-900">{value}</p>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${accents[accent] || accents.indigo}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </div>
    </article>
  );
}

StatCard.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, accent: PropTypes.string };
