import { useEffect, useRef, useState } from "react";
import { Modal, Button } from "./ui";
import { CheckCircle } from "../icons";
import { useApp } from "../store";

const SOURCES = ["CRM", "Billing", "Web Forms", "Imports", "API"];

export default function ScanModal() {
  const { scanOpen, closeScan, finishScan, toast, navigate, records } = useApp();
  const [pct, setPct] = useState(0);
  const [found, setFound] = useState<number | null>(null);
  const done = useRef(false);

  useEffect(() => {
    if (!scanOpen) {
      setPct(0);
      setFound(null);
      done.current = false;
      return;
    }
    const t = setInterval(() => setPct((p) => Math.min(100, p + 5)), 120);
    return () => clearInterval(t);
  }, [scanOpen]);

  useEffect(() => {
    if (scanOpen && pct >= 100 && !done.current) {
      done.current = true;
      const n = finishScan();
      setFound(n);
      toast(n ? `Scan complete — ${n} new duplicate${n > 1 ? "s" : ""} found` : "Scan complete — no new duplicates", n ? "info" : "success");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct, scanOpen]);

  const finished = found !== null;
  const current = SOURCES[Math.min(SOURCES.length - 1, Math.floor(pct / 20))];

  return (
    <Modal
      open={scanOpen}
      onClose={closeScan}
      title="Duplicate scan"
      footer={
        finished ? (
          <>
            <Button variant="secondary" onClick={closeScan}>
              Close
            </Button>
            <Button
              onClick={() => {
                closeScan();
                navigate("duplicates");
              }}
            >
              Review duplicates
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={closeScan}>
            Cancel scan
          </Button>
        )
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {finished
            ? `Scanned ${records.length} records across ${SOURCES.length} sources.`
            : `Scanning ${current}…`}
        </p>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        >
          <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <ul className="space-y-1.5">
          {SOURCES.map((s, i) => {
            const complete = pct >= (i + 1) * 20;
            return (
              <li key={s} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <CheckCircle className={`h-4 w-4 ${complete ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"}`} />
                {s}
              </li>
            );
          })}
        </ul>
        {finished && (
          <p className="rounded-xl bg-indigo-50 px-3.5 py-2.5 text-sm font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            {found ? `${found} new potential duplicate${found > 1 ? "s" : ""} added to the review queue.` : "No new duplicates found."}
          </p>
        )}
      </div>
    </Modal>
  );
}
