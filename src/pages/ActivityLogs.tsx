import { useState } from "react";
import { Card, Badge, Avatar, Button, ConfirmModal } from "../components/ui";
import {
  CheckCircle,
  Database,
  Copy,
  AlertTriangle,
  Settings,
  Download,
  Zap,
  Clock,
  Trash,
  Inbox,
} from "../icons";
import { useApp } from "../store";
import { downloadCsv } from "../utils/csv";

const filters = [
  { key: "all", label: "All" },
  { key: "merge", label: "Merges" },
  { key: "scan", label: "Scans" },
  { key: "import", label: "Imports" },
  { key: "warning", label: "Warnings" },
  { key: "settings", label: "Settings" },
  { key: "export", label: "Exports" },
];

const typeMeta: Record<
  string,
  { Icon: any; tone: string; color: string }
> = {
  merge: { Icon: Copy, tone: "indigo", color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" },
  scan: { Icon: Zap, tone: "sky", color: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400" },
  import: { Icon: Database, tone: "emerald", color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
  warning: { Icon: AlertTriangle, tone: "amber", color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
  settings: { Icon: Settings, tone: "slate", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
  export: { Icon: Download, tone: "indigo", color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" },
};

export default function ActivityLogs() {
  const { log, clearLog, toast } = useApp();
  const [filter, setFilter] = useState("all");
  const [clearOpen, setClearOpen] = useState(false);
  const activityLog = filter === "all" ? log : log.filter((l) => l.type === filter);

  const exportLog = () => {
    if (log.length === 0) return toast("The activity log is empty.", "error");
    downloadCsv(
      "dataguard-activity-log.csv",
      activityLog.map((l) => ({ date: l.date, time: l.time, actor: l.actor, action: l.action, target: l.target, type: l.type })),
    );
    toast(`Exported ${activityLog.length} log entr${activityLog.length === 1 ? "y" : "ies"}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Activity Logs</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            A chronological record of system and team actions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportLog}>
            <Download className="h-4 w-4" /> Export log
          </Button>
          <Button variant="secondary" disabled={log.length === 0} onClick={() => setClearOpen(true)}>
            <Trash className="h-4 w-4" /> Clear
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filter === f.key
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Timeline */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">Timeline</h2>
          {activityLog.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Inbox className="h-6 w-6" />
              </span>
              <p className="mt-3 font-semibold text-slate-700 dark:text-slate-200">No activity to show</p>
              <p className="text-sm text-slate-400">
                {filter === "all" ? "Actions you take will appear here." : "Nothing matches this filter."}
              </p>
            </div>
          )}
          <ol className="relative space-y-6 border-l border-slate-200 pl-6 dark:border-slate-800">
            {activityLog.map((a, i) => {
              const meta = typeMeta[a.type] ?? typeMeta.settings;
              const Icon = meta.Icon;
              return (
                <li key={i} className="relative">
                  <span
                    className={`absolute -left-[33px] flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900 ${meta.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{a.actor}</span>
                    <span className="text-slate-500 dark:text-slate-400">{a.action}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <Badge tone={meta.tone as any}>{a.target}</Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {a.date} · {a.time}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        {/* Side activity table / contributors */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Summary</h2>
            <div className="mt-4 space-y-3">
              {[
                { label: "Records merged", value: "42", Icon: Copy, tone: "indigo" },
                { label: "Scans completed", value: "3", Icon: Zap, tone: "sky" },
                { label: "Records imported", value: "3,120", Icon: Database, tone: "emerald" },
                { label: "Warnings flagged", value: "118", Icon: AlertTriangle, tone: "amber" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3 rounded-xl bg-slate-50/70 p-3 dark:bg-slate-800/40">
                  <Badge tone={s.tone as any}>
                    <s.Icon className="h-3.5 w-3.5" />
                  </Badge>
                  <span className="text-sm text-slate-600 dark:text-slate-300">{s.label}</span>
                  <span className="ml-auto font-bold text-slate-800 dark:text-slate-100">{s.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Top Contributors</h2>
            <div className="mt-4 space-y-3">
              {[
                { name: "Kacie Velasquez", actions: 128 },
                { name: "Daniel Cho", actions: 94 },
                { name: "Priya Raman", actions: 61 },
                { name: "Marcus Lee", actions: 47 },
              ].map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <Avatar name={c.name} className="h-9 w-9" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{c.name}</span>
                  <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> {c.actions}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <ConfirmModal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={() => {
          clearLog();
          toast("Activity log cleared", "info");
        }}
        title="Clear activity log"
        message="This removes every entry from the activity log. Continue?"
        confirmLabel="Clear log"
        danger
      />
    </div>
  );
}
