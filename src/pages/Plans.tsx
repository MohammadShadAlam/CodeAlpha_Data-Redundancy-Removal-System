import { useState } from "react";
import { Card, Button, Badge, Modal, ConfirmModal, Toggle } from "../components/ui";
import { CheckCircle, Download, CreditCard } from "../icons";
import { useApp, type PlanKey } from "../store";
import { downloadFile } from "../utils/csv";

const plans: {
  key: PlanKey;
  name: string;
  monthly: number | null;
  blurb: string;
  features: string[];
}[] = [
  {
    key: "starter",
    name: "Starter",
    monthly: 0,
    blurb: "For individuals getting started with data cleanup.",
    features: ["Up to 10,000 records", "Manual duplicate scans", "2 connected sources", "Email support"],
  },
  {
    key: "pro",
    name: "Pro",
    monthly: 49,
    blurb: "For teams that need automated, always-on deduplication.",
    features: ["Up to 500,000 records", "Scheduled & automatic scans", "Unlimited sources", "Fuzzy matching", "Priority support"],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    monthly: null,
    blurb: "For organisations with custom security and scale needs.",
    features: ["Unlimited records", "SSO & audit exports", "Dedicated success manager", "Custom matching rules", "99.9% uptime SLA"],
  },
];

const invoices = [
  { id: "INV-2026-009", date: "Sep 01, 2026", amount: "$49.00", status: "Paid" },
  { id: "INV-2026-008", date: "Aug 01, 2026", amount: "$49.00", status: "Paid" },
  { id: "INV-2026-007", date: "Jul 01, 2026", amount: "$49.00", status: "Paid" },
];

export default function Plans() {
  const { plan, setPlan, toast, profile } = useApp();
  const [yearly, setYearly] = useState(false);
  const [target, setTarget] = useState<PlanKey | null>(null);
  const [salesOpen, setSalesOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [msgError, setMsgError] = useState("");

  const current = plans.find((p) => p.key === plan)!;
  const targetPlan = plans.find((p) => p.key === target);
  const rank = { starter: 0, pro: 1, enterprise: 2 };

  const price = (m: number | null) =>
    m === null ? "Custom" : m === 0 ? "$0" : `$${yearly ? Math.round(m * 0.8) : m}`;

  const downloadInvoice = (inv: (typeof invoices)[number]) => {
    downloadFile(
      `${inv.id}.txt`,
      [
        "DataGuard — Invoice",
        `Invoice: ${inv.id}`,
        `Date: ${inv.date}`,
        `Billed to: ${profile.name} <${profile.email}>`,
        `Plan: Pro (monthly)`,
        `Amount: ${inv.amount}`,
        `Status: ${inv.status}`,
        "",
        "Prototype invoice generated for demonstration only.",
      ].join("\n"),
      "text/plain;charset=utf-8",
    );
    toast(`Downloaded ${inv.id}`);
  };

  const sendSales = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      setMsgError("Please tell us a little more (at least 10 characters).");
      return;
    }
    setSalesOpen(false);
    setMessage("");
    setMsgError("");
    toast("Thanks! Our sales team will contact you shortly.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Plans &amp; Billing</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your subscription, billing cycle and invoices.
        </p>
      </div>

      <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <CreditCard className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Current plan</p>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{current.name}</p>
        </div>
        <div className="sm:ml-auto sm:text-right">
          <Badge tone="emerald">Active</Badge>
          <p className="mt-1 text-xs text-slate-400">
            {plan === "starter" ? "Free forever" : plan === "pro" ? "Renews Nov 01, 2026" : "Custom contract"}
          </p>
        </div>
      </Card>

      <div className="flex items-center justify-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
        <span className={!yearly ? "font-bold text-slate-900 dark:text-white" : ""}>Monthly</span>
        <Toggle checked={yearly} onChange={setYearly} label="Bill yearly" />
        <span className={yearly ? "font-bold text-slate-900 dark:text-white" : ""}>
          Yearly <Badge tone="emerald">Save 20%</Badge>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = p.key === plan;
          return (
            <Card
              key={p.key}
              className={`flex flex-col p-6 ${isCurrent ? "ring-2 ring-indigo-600" : ""}`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{p.name}</h2>
                {isCurrent && <Badge tone="indigo">Current</Badge>}
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{p.blurb}</p>
              <p className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{price(p.monthly)}</span>
                {p.monthly !== null && <span className="text-sm text-slate-400"> /month</span>}
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {isCurrent ? (
                  <Button variant="secondary" className="w-full" disabled>
                    Current plan
                  </Button>
                ) : p.key === "enterprise" ? (
                  <Button className="w-full" onClick={() => setSalesOpen(true)}>
                    Contact sales
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={rank[p.key] > rank[plan] ? "primary" : "secondary"}
                    onClick={() => setTarget(p.key)}
                  >
                    {rank[p.key] > rank[plan] ? `Upgrade to ${p.name}` : `Switch to ${p.name}`}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Billing history</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Download past invoices.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <th className="px-5 py-3 font-semibold">Invoice</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">{inv.id}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{inv.date}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-100">{inv.amount}</td>
                  <td className="px-5 py-3.5"><Badge tone="emerald">{inv.status}</Badge></td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => downloadInvoice(inv)}
                      aria-label={`Download ${inv.id}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmModal
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={() => {
          if (!target) return;
          setPlan(target);
          toast(`You're now on the ${targetPlan?.name} plan`);
        }}
        title={`Switch to ${targetPlan?.name ?? ""}`}
        message={`Your subscription will change to the ${targetPlan?.name} plan (${price(targetPlan?.monthly ?? 0)}${targetPlan?.monthly ? "/month" : ""}). You can switch again at any time.`}
        confirmLabel="Confirm change"
      />

      <Modal
        open={salesOpen}
        onClose={() => setSalesOpen(false)}
        title="Contact sales"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSalesOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="sales-form">
              Send message
            </Button>
          </>
        }
      >
        <form id="sales-form" onSubmit={sendSales} noValidate>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              How can we help?
            </span>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your data volume and requirements…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {msgError && <span className="mt-1 block text-xs font-medium text-rose-600">{msgError}</span>}
          </label>
          <p className="mt-3 text-xs text-slate-400">We'll reply to {profile.email}.</p>
        </form>
      </Modal>
    </div>
  );
}
