import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Card, Badge, SectionHeading, Avatar, statusTone, Button } from "../components/ui";
import {
  TrendUp,
  TrendDown,
  Database,
  CheckCircle,
  Copy,
  Zap,
  Download,
} from "../icons";
import {
  statCards,
  recordsTrend,
  qualityBreakdown,
  sourceData,
  recentActivity,
} from "../data";
import { useTheme } from "../theme";
import { useApp } from "../store";
import { downloadCsv } from "../utils/csv";

const accentMap: Record<string, { bg: string; icon: string; Icon: any }> = {
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    icon: "text-indigo-600 dark:text-indigo-400",
    Icon: Database,
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-400",
    Icon: CheckCircle,
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    icon: "text-amber-600 dark:text-amber-400",
    Icon: Copy,
  },
  sky: {
    bg: "bg-sky-50 dark:bg-sky-500/10",
    icon: "text-sky-600 dark:text-sky-400",
    Icon: Zap,
  },
};

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color || p.fill }}
          />
          {p.name}: {Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

const statTarget: Record<string, "records" | "duplicates" | "validation"> = {
  total: "records",
  unique: "records",
  duplicates: "duplicates",
  quality: "validation",
};

export default function Overview() {
  const { theme } = useTheme();
  const { profile, pairs: duplicatePairs, navigate, setSearch, openScan, toast, addLog } = useApp();

  const exportSummary = () => {
    downloadCsv("dataguard-overview.csv", [
      ...statCards.map((s) => ({ section: "Summary", name: s.label, value: s.value, change: s.delta })),
      ...sourceData.map((s) => ({ section: "By source", name: s.source, value: s.clean, change: `${s.dupes} duplicates` })),
    ]);
    addLog("exported the overview summary", "Overview", "export");
    toast("Overview summary exported");
  };
  const grid = theme === "dark" ? "#1e293b" : "#eef2f7";
  const axis = theme === "dark" ? "#64748b" : "#94a3b8";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 p-6 text-white sm:flex-row sm:items-center sm:p-7">
        <div>
          <p className="text-sm font-medium text-indigo-100">Welcome back, {profile.name.split(" ")[0]} 👋</p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Overview</h1>
          <p className="mt-1.5 max-w-xl text-sm text-indigo-100">
            Your data is 94.7% clean. 42 duplicates were merged automatically this week.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openScan}
            className="rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/25"
          >
            Run scan
          </button>
          <button
            onClick={exportSummary}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s) => {
          const a = accentMap[s.accent];
          const Icon = a.Icon;
          return (
            <button
              key={s.key}
              onClick={() => {
                if (statTarget[s.key] === "records") setSearch({ query: "", status: "All" });
                navigate(statTarget[s.key]);
              }}
              className="rounded-2xl text-left transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
            <Card className="h-full p-5">
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.bg}`}>
                  <Icon className={`h-6 w-6 ${a.icon}`} />
                </div>
                <Badge tone={s.trend === "up" ? "emerald" : "rose"}>
                  {s.trend === "up" ? (
                    <TrendUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendDown className="h-3.5 w-3.5" />
                  )}
                  {s.delta}
                </Badge>
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                {s.value}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{s.sub}</p>
            </Card>
            </button>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <SectionHeading
            title="Records & Duplicates Trend"
            subtitle="Last 7 months of ingestion and deduplication"
          />
          <div className="mt-5 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={recordsTrend} margin={{ left: -12, right: 6, top: 6 }}>
                <defs>
                  <linearGradient id="gRecords" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDupes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis dataKey="month" stroke={axis} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axis} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="records" name="Records" stroke="#4f46e5" strokeWidth={2.5} fill="url(#gRecords)" />
                <Area type="monotone" dataKey="duplicates" name="Duplicates" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gDupes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeading title="Data Quality" subtitle="Validation outcome split" />
          <div className="mt-2 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={qualityBreakdown}
                  dataKey="value"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={3}
                  stroke="none"
                >
                  {qualityBreakdown.map((e) => (
                    <Cell key={e.name} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {qualityBreakdown.map((q) => (
              <div key={q.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: q.color }} />
                  {q.name}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {q.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bar + Duplicate summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <SectionHeading title="Records by Source" subtitle="Clean records vs detected duplicates" />
          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} margin={{ left: -12, right: 6, top: 6 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis dataKey="source" stroke={axis} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axis} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: theme === "dark" ? "#1e293b55" : "#f1f5f988" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="clean" name="Clean" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="dupes" name="Duplicates" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeading
            title="Duplicate Summary"
            subtitle="Top detected matches"
            action={
              <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => navigate("duplicates")}>
                Review all
              </Button>
            }
          />
          <div className="mt-4 space-y-3">
            {duplicatePairs.length === 0 && (
              <p className="rounded-xl bg-emerald-50 px-3.5 py-6 text-center text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                No pending duplicates 🎉
              </p>
            )}
            {duplicatePairs.slice(0, 3).map((d) => (
              <button
                key={d.id}
                onClick={() => navigate("duplicates")}
                className="block w-full rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 text-left hover:border-indigo-200 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-indigo-500/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {d.master.name}
                  </span>
                  <Badge tone={d.confidence > 90 ? "rose" : "amber"}>
                    {d.confidence}% match
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{d.reason}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <span>{d.master.id}</span>
                  <span>↔</span>
                  <span>{d.duplicate.id}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent activity table */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <SectionHeading title="Recent Records" subtitle="Latest ingested and processed entries" />
          <Button
            variant="secondary"
            onClick={() => {
              setSearch({ query: "", status: "All" });
              navigate("records");
            }}
          >
            View all
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <th className="px-5 py-3 font-semibold">Record</th>
                <th className="px-5 py-3 font-semibold">Source</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Quality</th>
                <th className="px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentActivity.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.name} className="h-9 w-9" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{r.name}</p>
                        <p className="text-xs text-slate-400">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{r.source}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                        <div
                          className={`h-full rounded-full ${r.score > 85 ? "bg-emerald-500" : r.score > 70 ? "bg-amber-500" : "bg-rose-500"}`}
                          style={{ width: `${r.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-500">{r.score}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
