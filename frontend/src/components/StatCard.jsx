export default function StatCard({ icon: Icon, label, value, tone = "cyan" }) {
  const tones = {
    cyan: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    red: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
  };
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon size={22} />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
