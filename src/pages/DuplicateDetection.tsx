import { useState } from "react";
import { Card, Badge, Button, ConfirmModal } from "../components/ui";
import {
  Copy,
  CheckCircle,
  Trash,
  AlertTriangle,
  Zap,
  Refresh,
} from "../icons";
import { useApp } from "../store";

const API_URL = "http://127.0.0.1:8000";

type ScanRecord = {
  name: string;
  email: string;
  phone?: string | null;
};


type ScanDuplicate = {
  master_record_number: number;
  record_number: number;
  name: string;
  email: string;
  phone: string | null;
  matched_by: string[];
};


type ScanResponse = {
  total_records: number;
  duplicates_found: number;
  duplicates: ScanDuplicate[];
};

function FieldRow({
  label,
  a,
  b,
  match,
}: {
  label: string;
  a: string;
  b: string;
  match: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg">
      <div className="bg-slate-50/80 px-3 py-2 dark:bg-slate-800/40">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-200">
          {a}
        </p>
      </div>

      <div
        className={`px-3 py-2 ${
          match
            ? "bg-emerald-50/70 dark:bg-emerald-500/5"
            : "bg-rose-50/70 dark:bg-rose-500/5"
        }`}
      >
        <p className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
          {match ? (
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
          )}
        </p>

        <p
          className={`mt-0.5 text-sm font-medium ${
            match
              ? "text-slate-700 dark:text-slate-200"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {b}
        </p>
      </div>
    </div>
  );
}

export default function DuplicateDetection() {
  const {
  addBackendDuplicates,
  records,
  pairs,
  resolved,
  mergePair,
  deletePairDuplicate,
  dismissPair,
  openScan,
  toast,
  toasts,
} = useApp();

  const [deleting, setDeleting] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);

  const duplicatePairs = pairs;


  const runBackendScan = async () => {
    setScanning(true);
    setScanError("");
    setScanResult(null);

    try {
      const scanRecords: ScanRecord[] = records.map((record) => ({
        name: record.name || "",
        email: record.email || "",
        phone: record.phone || "",
      }));

      if (scanRecords.length === 0) {
        setScanError(
          "No application records found. Add records first, then run the scan."
        );
        return;
      }

      const response = await fetch(`${API_URL}/detect-duplicates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records: scanRecords }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const result: ScanResponse = await response.json();
     
       console.log("Backend scan result:", result);
     
 setScanResult(result);

      console.log("Backend duplicates:", JSON.stringify(result.duplicates, null, 2));
console.log("Frontend records:", records.map((r, i) => ({
  position: i + 1,
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone,
})));


      const addedCount = addBackendDuplicates(result.duplicates);

      console.log("Showing scan notification", {
  addedCount,
  duplicatesFound: result.duplicates_found,
});
     
  

      toast(
        addedCount > 0
          ? `Scan complete: ${addedCount} new duplicate(s) added for review.`
          : result.duplicates_found > 0
            ? `Scan complete: ${result.duplicates_found} duplicate(s) found. All are already in review.`
            : "Scan complete: No duplicates found.",
        "info"
      );
      console.log("Toast state after scan:", toasts);      

    } catch (error) {
      console.error("DataGuard scan failed:", error);

      setScanError(
        "Backend connection failed. Make sure the Python FastAPI server is running at http://127.0.0.1:8000."
      );
    } finally {
      setScanning(false);
    }
  };



  const summary = [
    {
      label: "Potential Duplicates",
      value: (6631 + pairs.length - resolved).toLocaleString(),
      tone: "rose" as const,
      Icon: Copy,
    },
    {
      label: "Auto-Merged",
      value: (4128 + resolved).toLocaleString(),
      tone: "emerald" as const,
      Icon: CheckCircle,
    },
    {
      label: "Pending Review",
      value: (409 + pairs.length).toLocaleString(),
      tone: "amber" as const,
      Icon: AlertTriangle,
    },
    {
      label: "Avg. Confidence",
      value: "91.4%",
      tone: "indigo" as const,
      Icon: Zap,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Duplicate Detection
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review matched records side-by-side and resolve duplicates with
            confidence.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={runBackendScan}
          disabled={scanning}
        >
          <Refresh className="h-4 w-4" />
          {scanning ? "Scanning..." : "Run scan"}
        </Button>
      </div>

      {scanError && (
        <Card className="border border-rose-200 p-4 dark:border-rose-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            <div>
              <p className="font-semibold text-rose-700 dark:text-rose-400">
                Scan failed
              </p>
              <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">
                {scanError}
              </p>
            </div>
          </div>
        </Card>
      )}

      {scanResult && (
        <Card className="space-y-4 p-5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Backend Scan Results
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Results returned by the DataGuard API
              </p>
            </div>

            <Badge tone={scanResult.duplicates_found > 0 ? "rose" : "emerald"}>
              {scanResult.duplicates_found} duplicate(s)
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Records scanned
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                {scanResult.total_records}
              </p>
            </div>

            <div className="rounded-xl bg-rose-50 p-4 dark:bg-rose-500/10">
              <p className="text-sm text-rose-600 dark:text-rose-400">
                Duplicates found
              </p>
              <p className="mt-1 text-2xl font-extrabold text-rose-700 dark:text-rose-300">
                {scanResult.duplicates_found}
              </p>
            </div>
          </div>

          {scanResult.duplicates.length === 0 ? (
            <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              No duplicate records were found in this scan.
            </p>
          ) : (
            <div className="space-y-3">
              {scanResult.duplicates.map((record) => (
                <div
                  key={`${record.record_number}-${record.email}`}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <Copy className="h-4 w-4 text-rose-500" />
                    <p className="font-semibold text-slate-800 dark:text-white">
                      Duplicate record #{record.record_number}
                    </p>
                  </div>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Name: {record.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Email: {record.email}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Phone: {record.phone || "Not provided"}
                  </p>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-400">
            This scan analyzes the current application records using the
            DataGuard API.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label} className="p-5">
            <Badge tone={s.tone}>
              <s.Icon className="h-3.5 w-3.5" />
            </Badge>
            <p className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
              {s.value}
            </p>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {s.label}
            </p>
          </Card>
        ))}
      </div>

      <div className="space-y-5">
        {duplicatePairs.length === 0 && (
          <Card className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle className="h-7 w-7" />
            </span>

            <p className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-100">
              You're all caught up
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              There are no duplicate matches waiting for review.
            </p>

            <Button className="mt-5" onClick={openScan}>
              <Refresh className="h-4 w-4" /> Scan again
            </Button>
          </Card>
        )}

        {duplicatePairs.map((d) => {
          const fields = [
            {
              label: "Record ID",
              a: d.master.id,
              b: d.duplicate.id,
              match: false,
            },
            {
              label: "Name",
              a: d.master.name,
              b: d.duplicate.name,
              match: d.master.name === d.duplicate.name,
            },
            {
              label: "Email",
              a: d.master.email,
              b: d.duplicate.email,
              match: d.master.email === d.duplicate.email,
            },
            {
              label: "Phone",
              a: d.master.phone,
              b: d.duplicate.phone,
              match: d.master.phone === d.duplicate.phone,
            },
            {
              label: "Source",
              a: d.master.source,
              b: d.duplicate.source,
              match: d.master.source === d.duplicate.source,
            },
          ];

          return (
            <Card key={d.id} className="overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                    <Copy className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      Match {d.id}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {d.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Confidence</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      {d.confidence}%
                    </p>
                  </div>
                  <div className="h-10 w-20 self-center overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full ${
                        d.confidence > 90 ? "bg-rose-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${d.confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-2 grid grid-cols-2 gap-2 text-xs font-semibold">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Badge tone="emerald">Master Record</Badge>
                  </span>
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Badge tone="rose">Duplicate</Badge>
                  </span>
                </div>

                <div className="space-y-1.5">
                  {fields.map((field) => (
                    <FieldRow key={field.label} {...field} />
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 p-5 dark:border-slate-800">
                <Button
                  variant="ghost"
                  onClick={() => {
                    dismissPair(d.id);
                    toast(`${d.id} marked as not a duplicate`, "info");
                  }}
                >
                  Not a Duplicate
                </Button>

                <Button variant="danger" onClick={() => setDeleting(d.id)}>
                  <Trash className="h-4 w-4" /> Delete Duplicate
                </Button>

                <Button
                  onClick={() => {
                    mergePair(d.id);
                    toast(`Merged ${d.duplicate.id} into ${d.master.id}`);
                  }}
                >
                  <CheckCircle className="h-4 w-4" /> Merge Records
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;

          const duplicate = pairs.find((item) => item.id === deleting);
          deletePairDuplicate(deleting);
          toast(`Deleted duplicate ${duplicate?.duplicate.id ?? ""}`, "info");
          setDeleting(null);
        }}
        title="Delete duplicate record"
        message={`Delete ${
          pairs.find((item) => item.id === deleting)?.duplicate.id ??
          "this record"
        } and keep the master record? This cannot be undone.`}
        confirmLabel="Delete duplicate"
        danger
      />
    </div>
  );
}
