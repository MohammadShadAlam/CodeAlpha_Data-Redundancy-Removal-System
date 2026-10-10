import { useEffect, useMemo, useState } from "react";
import { Card, Badge, Button, Modal, Field, Avatar, ConfirmModal, statusTone, useDismiss } from "../components/ui";
import { Search, Filter, Plus, ChevronDown, Edit, Trash, Download, X } from "../icons";
import { useApp, type RecordItem } from "../store";
import { downloadCsv } from "../utils/csv";

const statuses = ["All", "Unique", "Duplicate", "Warning"];
const sources = ["CRM", "Billing", "Web Forms", "Imports", "API"];
const PAGE_SIZE = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormValues = { name: string; email: string; phone: string; source: string };

function RecordForm({
  initial,
  onSubmit,
}: {
  initial: FormValues;
  onSubmit: (v: FormValues) => void;
}) {
  // mounted fresh each time the dialog opens, so state always starts from `initial`
  const [v, setV] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: typeof errors = {};
    if (!v.name.trim()) er.name = "Name is required.";
    if (!EMAIL_RE.test(v.email.trim())) er.email = "Enter a valid email address.";
    if (v.phone.trim() && v.phone.replace(/\D/g, "").length < 6) er.phone = "Enter a valid phone number.";
    setErrors(er);
    if (Object.keys(er).length) return;
    onSubmit({ name: v.name.trim(), email: v.email.trim(), phone: v.phone.trim(), source: v.source });
  };

  return (
    <form id="record-form" onSubmit={submit} noValidate className="space-y-4">
      <Field label="Full Name" placeholder="e.g. Olivia Bennett" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={errors.name} />
      <Field label="Email Address" type="email" placeholder="name@company.com" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} error={errors.email} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Phone Number" placeholder="+1 555 000 0000" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} error={errors.phone} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Source</span>
          <select
            value={v.source}
            onChange={(e) => setV({ ...v, source: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {sources.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
    </form>
  );
}

function RecordFormModal({
  open,
  onClose,
  title,
  initial,
  submitLabel,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  initial: FormValues;
  submitLabel: string;
  onSubmit: (v: FormValues) => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="record-form">
            {submitLabel}
          </Button>
        </>
      }
    >
      <RecordForm initial={initial} onSubmit={onSubmit} />
    </Modal>
  );
}

export default function AllRecords() {
  const { records, search, setSearch, addRecord, updateRecord, deleteRecords, toast } = useApp();
  const { query, status } = search;

  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useDismiss(filterOpen, () => setFilterOpen(false));
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [deleting, setDeleting] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q);
      const matchesStatus = status === "All" || r.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [records, query, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  // go back to page 1 whenever the filters change
  useEffect(() => setPage(1), [query, status]);
  // drop selections that no longer exist
  useEffect(() => {
    setSelected((s) => {
      const ids = new Set(records.map((r) => r.id));
      const next = new Set([...s].filter((id) => ids.has(id)));
      return next.size === s.size ? s : next;
    });
  }, [records]);

  const allOnPageSelected = visible.length > 0 && visible.every((r) => selected.has(r.id));
  const toggleAll = () =>
    setSelected((s) => {
      const next = new Set(s);
      if (allOnPageSelected) visible.forEach((r) => next.delete(r.id));
      else visible.forEach((r) => next.add(r.id));
      return next;
    });
  const toggleOne = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const exportCsv = () => {
    const rows = selected.size ? records.filter((r) => selected.has(r.id)) : filtered;
    if (rows.length === 0) return toast("There are no records to export.", "error");
    downloadCsv("dataguard-records.csv", rows as unknown as Record<string, unknown>[], [
      "id", "name", "email", "phone", "source", "status", "date",
    ]);
    toast(`Exported ${rows.length} record${rows.length > 1 ? "s" : ""} to CSV`);
  };

  const hasFilters = query.trim() !== "" || status !== "All";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">All Records</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Browse and manage every record across your connected sources.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> Add Record
        </Button>
      </div>

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setSearch({ query: e.target.value })}
              placeholder="Search by name, email, or ID..."
              aria-label="Search records"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((o) => !o)}
                aria-expanded={filterOpen}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Filter className="h-4 w-4" />
                {status === "All" ? "Filter" : status}
                <ChevronDown className="h-4 w-4" />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-12 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSearch({ status: s });
                        setFilterOpen(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${
                        status === s
                          ? "font-semibold text-indigo-600 dark:text-indigo-400"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {hasFilters && (
              <Button variant="ghost" className="h-11" onClick={() => setSearch({ query: "", status: "All" })}>
                <X className="h-4 w-4" /> Clear
              </Button>
            )}
            <Button variant="secondary" className="h-11" onClick={exportCsv}>
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-indigo-100 bg-indigo-50 px-5 py-3 text-sm dark:border-indigo-500/20 dark:bg-indigo-500/10">
            <span className="font-semibold text-indigo-700 dark:text-indigo-300">{selected.size} selected</span>
            <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => setDeleting([...selected])}>
              <Trash className="h-3.5 w-3.5" /> Delete selected
            </Button>
            <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setSelected(new Set())}>
              Clear selection
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <th className="px-5 py-3 font-semibold">
                  <input
                    type="checkbox"
                    aria-label="Select all on this page"
                    checked={allOnPageSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                  />
                </th>
                <th className="px-5 py-3 font-semibold">Record ID</th>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold">Source</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {visible.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3.5">
                    <input
                      type="checkbox"
                      aria-label={`Select ${r.id}`}
                      checked={selected.has(r.id)}
                      onChange={() => toggleOne(r.id)}
                      className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                    />
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {r.id}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.name} className="h-9 w-9" />
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-slate-700 dark:text-slate-200">{r.email}</p>
                    <p className="text-xs text-slate-400">{r.phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{r.source}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditing(r)}
                        aria-label={`Edit ${r.id}`}
                        title="Edit"
                        className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleting([r.id])}
                        aria-label={`Delete ${r.id}`}
                        title="Delete"
                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-700"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                    No records match your filters.
                    {hasFilters && (
                      <button
                        onClick={() => setSearch({ query: "", status: "All" })}
                        className="ml-2 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filtered.length === 0 ? (
              "No records"
            ) : (
              <>
                Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{start + 1}–{start + visible.length}</span>{" "}
                of {filtered.length} record{filtered.length > 1 ? "s" : ""}
              </>
            )}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(safePage - 1)}
              disabled={safePage === 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Previous
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                aria-label={`Page ${n}`}
                aria-current={n === safePage ? "page" : undefined}
                className={
                  n === safePage
                    ? "rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white"
                    : "rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                }
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(safePage + 1)}
              disabled={safePage === pageCount}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      <RecordFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Record"
        submitLabel="Save Record"
        initial={{ name: "", email: "", phone: "", source: "CRM" }}
        onSubmit={(v) => {
          const clash = records.find((r) => r.email.toLowerCase() === v.email.toLowerCase());
          addRecord(v);
          setAddOpen(false);
          setSearch({ query: "", status: "All" });
          setPage(1);
          toast(`Record added for ${v.name}`);
          if (clash) {
            toast(`Same email as ${clash.id} — run a scan to review it as a duplicate.`, "info");
          }
        }}
      />

      <RecordFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.id}` : "Edit record"}
        submitLabel="Save changes"
        initial={
          editing
            ? { name: editing.name, email: editing.email, phone: editing.phone, source: editing.source }
            : { name: "", email: "", phone: "", source: "CRM" }
        }
        onSubmit={(v) => {
          if (!editing) return;
          updateRecord(editing.id, v);
          toast(`${editing.id} updated`);
          setEditing(null);
        }}
      />

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          deleteRecords(deleting);
          setSelected(new Set());
          toast(deleting.length === 1 ? `${deleting[0]} deleted` : `${deleting.length} records deleted`, "info");
        }}
        title="Delete records"
        message={
          deleting?.length === 1
            ? `Delete record ${deleting[0]}? This cannot be undone.`
            : `Delete ${deleting?.length ?? 0} selected records? This cannot be undone.`
        }
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
