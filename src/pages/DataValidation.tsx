import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";
import { Card, Badge, Button } from "../components/ui";
import { CheckCircle, AlertTriangle, X, Refresh, Download } from "../icons";
import { validationRules } from "../data";
import { useApp } from "../store";
import { downloadCsv } from "../utils/csv";

export default function DataValidation() {
  const { navigate, setSearch, toast, addLog } = useApp();
  const score = 94.7;
  const gauge = [{ name: "score", value: score, fill: "#4f46e5" }];

  const totals = validationRules.reduce(
    (acc, r) => {
      acc.passed += r.passed;
      acc.failed += r.failed;
      return acc;
    },
    { passed: 0, failed: 0 },
  );

  const severityTone = (s: string) =>
    s === "high" ? "rose" : s === "medium" ? "amber" : "slate";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Data Validation</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor rule compliance and keep every record standards-ready.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              downloadCsv(
                "dataguard-validation-report.csv",
                validationRules.map((r) => ({
                  rule: r.rule,
                  severity: r.severity,
                  passed: r.passed,
                  failed: r.failed,
                  compliance: `${Math.round((r.passed / (r.passed + r.failed)) * 100)}%`,
                })),
              );
              toast("Validation report exported");
            }}
          >
            <Download className="h-4 w-4" /> Export report
          </Button>
          <Button
            onClick={() => {
              addLog(`re-ran validation on ${validationRules.length} rules`, "Data Validation", "scan");
              toast(`Validation complete — ${validationRules.length} rules checked`);
            }}
          >
            <Refresh className="h-4 w-4" /> Re-run validation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Gauge */}
        <Card className="flex flex-col items-center justify-center p-6">
          <p className="self-start text-sm font-semibold text-slate-700 dark:text-slate-200">
            Overall Quality Score
          </p>
          <div className="relative mt-2 h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="72%"
                outerRadius="100%"
                data={gauge}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background={{ fill: "#e2e8f0" }} dataKey="value" cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{score}%</span>
              <span className="text-xs text-slate-400">Healthy</span>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            Score improved 1.6% from last validation cycle.
          </p>
        </Card>

        {/* Valid / Invalid summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          <Card className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Valid Records</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
              {totals.passed.toLocaleString()}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: "92%" }} />
            </div>
            <p className="mt-2 text-xs text-slate-400">92% of all records pass every rule</p>
          </Card>

          <Card className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              <X className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Invalid / Flagged</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
              {totals.failed.toLocaleString()}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-rose-500" style={{ width: "8%" }} />
            </div>
            <p className="mt-2 text-xs text-slate-400">8% need manual correction or review</p>
          </Card>

          <Card className="p-6 sm:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  7,486 records raised validation warnings
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mostly phone format and country code mismatches.
                </p>
              </div>
              <Button
                variant="secondary"
                className="ml-auto"
                onClick={() => {
                  setSearch({ status: "Warning", query: "" });
                  navigate("records");
                }}
              >
                Review
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Rules table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Validation Rules</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Pass / fail breakdown per active rule
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <th className="px-5 py-3 font-semibold">Rule</th>
                <th className="px-5 py-3 font-semibold">Severity</th>
                <th className="px-5 py-3 font-semibold">Passed</th>
                <th className="px-5 py-3 font-semibold">Failed</th>
                <th className="px-5 py-3 font-semibold">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {validationRules.map((r) => {
                const rate = Math.round((r.passed / (r.passed + r.failed)) * 100);
                return (
                  <tr key={r.rule} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-100">{r.rule}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={severityTone(r.severity)}>{r.severity}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-emerald-600 dark:text-emerald-400">
                      {r.passed.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-rose-600 dark:text-rose-400">
                      {r.failed.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                          <div
                            className={`h-full rounded-full ${rate > 95 ? "bg-emerald-500" : rate > 90 ? "bg-amber-500" : "bg-rose-500"}`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
