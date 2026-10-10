import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  allRecords as seedRecords,
  duplicatePairs as seedPairs,
  activityLog as seedLog,
} from "./data";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type RecordItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  date: string;
};

type PairSide = Omit<RecordItem, "status">;

export type Pair = {
  id: string;
  confidence: number;
  reason: string;
  master: PairSide;
  duplicate: PairSide;
};

export type LogItem = {
  time: string;
  date: string;
  actor: string;
  action: string;
  target: string;
  type: string;
  mine?: boolean;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: "duplicate" | "scan" | "warning" | "system";
};

export type Profile = {
  name: string;
  email: string;
  phone: string;
  role: string;
  team: string;
  location: string;
  bio: string;
  avatar: string | null;
};

export type Prefs = {
  notif: { email: boolean; duplicates: boolean; weekly: boolean };
  detection: { auto: boolean; fuzzy: boolean; strict: boolean };
  threshold: number;
};

export type SessionItem = { id: string; device: string; place: string; when: string; current: boolean };

export type PlanKey = "starter" | "pro" | "enterprise";

type ToastItem = { id: number; msg: string; tone: "success" | "error" | "info" };

export const PAGES = [
  "overview",
  "records",
  "duplicates",
  "validation",
  "logs",
  "settings",
  "profile",
  "notifications",
  "plans",
] as const;
export type PageKey = (typeof PAGES)[number];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "dataguard-state-v1";

const fmtDate = () =>
  new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
const fmtTime = () =>
  new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const digits = (s: string) => s.replace(/\D/g, "");
const num = (id: string) => parseInt(id.replace(/\D/g, ""), 10) || 0;
const pairKey = (a: string, b: string) => [a, b].sort().join("|");

const stripStatus = ({ status: _s, ...rest }: RecordItem): PairSide => rest;

/** Real duplicate detection over the current records (same email or same phone). */
export function detectPairs(records: RecordItem[], skip: Set<string>, startId: number): Pair[] {
  const found: Pair[] = [];
  let n = startId;
  for (let i = 0; i < records.length; i++) {
    for (let j = i + 1; j < records.length; j++) {
      const a = records[i];
      const b = records[j];
      const sameEmail = !!a.email && a.email.toLowerCase() === b.email.toLowerCase();
      const sameDigits = digits(a.phone).length > 5 && digits(a.phone) === digits(b.phone);
      if (!sameEmail && !sameDigits) continue;
      const key = pairKey(a.id, b.id);
      if (skip.has(key)) continue;
      const [master, dup] = num(a.id) >= num(b.id) ? [a, b] : [b, a];
      found.push({
        id: `DUP-${n++}`,
        confidence: sameEmail && sameDigits ? 97 : sameEmail ? 92 : 88,
        reason:
          sameEmail && sameDigits
            ? "Matching email + phone"
            : sameEmail
              ? "Matching email address"
              : "Matching phone number",
        master: stripStatus(master),
        duplicate: stripStatus(dup),
      });
      skip.add(key);
    }
  }
  return found;
}

const seedNotifications: NotificationItem[] = [
  { id: "n1", type: "duplicate", title: "New duplicates detected", body: "3 high-confidence matches are waiting for your review.", time: "5 min ago", read: false },
  { id: "n2", type: "scan", title: "Scheduled scan completed", body: "All sources were scanned. Data quality score is 94.7%.", time: "1 hour ago", read: false },
  { id: "n3", type: "warning", title: "Validation warnings", body: "118 records from Web Forms need phone number fixes.", time: "Yesterday", read: false },
  { id: "n4", type: "system", title: "Daniel Cho imported records", body: "3,120 new records were added to Imports.", time: "Yesterday", read: true },
  { id: "n5", type: "system", title: "Weekly report ready", body: "Your data quality report for last week is ready to export.", time: "2 days ago", read: true },
];

const seedProfile: Profile = {
  name: "Kacie Velasquez",
  email: "kacie@dataguard.io",
  phone: "+1 415 555 0132",
  role: "Data Administrator",
  team: "Data Operations",
  location: "San Francisco, CA",
  bio: "I keep our customer data clean, consistent and duplicate-free.",
  avatar: null,
};

const seedPrefs: Prefs = {
  notif: { email: true, duplicates: true, weekly: false },
  detection: { auto: true, fuzzy: true, strict: false },
  threshold: 90,
};

const seedSessions: SessionItem[] = [
  { id: "s1", device: "Chrome on Windows", place: "San Francisco, US", when: "Active now", current: true },
  { id: "s2", device: "Safari on iPhone", place: "San Francisco, US", when: "2 hours ago", current: false },
  { id: "s3", device: "Firefox on macOS", place: "Austin, US", when: "3 days ago", current: false },
];

type Persisted = {
  records: RecordItem[];
  pairs: Pair[];
  dismissed: string[];
  resolved: number;
  log: LogItem[];
  notifications: NotificationItem[];
  profile: Profile;
  prefs: Prefs;
  plan: PlanKey;
  twoFA: boolean;
  sessions: SessionItem[];
};

const freshState = (): Persisted => ({
  records: seedRecords.map((r) => ({ ...r })),
  pairs: seedPairs.map((p) => ({ ...p })),
  dismissed: [],
  resolved: 0,
  log: seedLog.map((l) => ({ ...l })),
  notifications: seedNotifications.map((n) => ({ ...n })),
  profile: { ...seedProfile },
  prefs: JSON.parse(JSON.stringify(seedPrefs)),
  plan: "pro",
  twoFA: false,
  sessions: seedSessions.map((s) => ({ ...s })),
});

function load(): Persisted {
  const base = freshState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...base, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return base;
}

function pageFromHash(): PageKey {
  const h = window.location.hash.replace(/^#\/?/, "");
  return (PAGES as readonly string[]).includes(h) ? (h as PageKey) : "overview";
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

type NewRecord = { name: string; email: string; phone: string; source: string };

type AppContextValue = Persisted & {
  page: PageKey;
  navigate: (p: PageKey) => void;
  signedIn: boolean;
  signIn: () => void;
  signOut: () => void;

  search: { query: string; status: string };
  setSearch: (s: Partial<{ query: string; status: string }>) => void;

  toasts: ToastItem[];
  toast: (msg: string, tone?: ToastItem["tone"]) => void;
  dismissToast: (id: number) => void;

  scanOpen: boolean;
  openScan: () => void;
  closeScan: () => void;
  finishScan: () => number;

  addRecord: (r: NewRecord) => void;
  updateRecord: (id: string, patch: Partial<NewRecord>) => void;
  deleteRecords: (ids: string[]) => void;

  mergePair: (id: string) => void;
  deletePairDuplicate: (id: string) => void;
  dismissPair: (id: string) => void;

  addLog: (action: string, target: string, type: string) => void;
  clearLog: () => void;

  markRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;

  updateProfile: (p: Partial<Profile>) => void;
  updatePrefs: (fn: (p: Prefs) => Prefs) => void;
  setPlan: (p: PlanKey) => void;
  setTwoFA: (v: boolean) => void;
  revokeSession: (id: string) => void;
  resetData: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(load);
  const [page, setPage] = useState<PageKey>(pageFromHash);
  const [signedIn, setSignedIn] = useState(() => {
    try {
      return window.sessionStorage.getItem("dataguard-signedout") !== "1";
    } catch {
      return true;
    }
  });
  const [search, setSearchState] = useState({ query: "", status: "All" });
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [scanOpen, setScanOpen] = useState(false);
  const toastId = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  // persist
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota / private mode */
    }
  }, [state]);

  // hash routing
  useEffect(() => {
    const onHash = () => {
      setPage(pageFromHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((p: PageKey) => {
    // update state straight away; the hash is kept in sync for deep links / back button
    setPage(p);
    if (window.location.hash !== `#${p}`) {
      window.location.hash = p;
    }
    window.scrollTo({ top: 0 });
  }, []);

  const toast = useCallback((msg: string, tone: ToastItem["tone"] = "success") => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-3), { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const patch = useCallback((fn: (s: Persisted) => Partial<Persisted>) => {
    setState((s) => ({ ...s, ...fn(s) }));
  }, []);

  const logEntry = (s: Persisted, action: string, target: string, type: string): LogItem[] => [
    { time: fmtTime(), date: fmtDate(), actor: s.profile.name, action, target, type, mine: true },
    ...s.log,
  ];
  const notif = (
    s: Persisted,
    title: string,
    body: string,
    type: NotificationItem["type"],
  ): NotificationItem[] => [
    { id: `n${Date.now()}${Math.random().toString(36).slice(2, 5)}`, title, body, type, time: "Just now", read: false },
    ...s.notifications,
  ];

  const value: AppContextValue = useMemo(
    () => ({
      ...state,
      page,
      navigate,
      signedIn,
      signIn: () => {
        try {
          window.sessionStorage.removeItem("dataguard-signedout");
        } catch {
          /* ignore */
        }
        setSignedIn(true);
        window.location.hash = "overview";
      },
      signOut: () => {
        try {
          window.sessionStorage.setItem("dataguard-signedout", "1");
        } catch {
          /* ignore */
        }
        setSignedIn(false);
      },

      search,
      setSearch: (s) => setSearchState((p) => ({ ...p, ...s })),

      toasts,
      toast,
      dismissToast,

      scanOpen,
      openScan: () => setScanOpen(true),
      closeScan: () => setScanOpen(false),
      finishScan: () => {
        const s = stateRef.current;
        const skip = new Set<string>([
          ...s.dismissed,
          ...s.pairs.map((p) => pairKey(p.master.id, p.duplicate.id)),
        ]);
        const maxDup = s.pairs.reduce((m, p) => Math.max(m, num(p.id)), 4471);
        const found = detectPairs(s.records, skip, maxDup + 1);
        patch((cur) => ({
          pairs: [...found, ...cur.pairs],
          log: logEntry(
            cur,
            found.length
              ? `completed a manual scan and found ${found.length} new duplicate${found.length > 1 ? "s" : ""}`
              : "completed a manual scan — no new duplicates",
            "All sources",
            "scan",
          ),
          notifications: notif(
            cur,
            "Scan completed",
            found.length
              ? `${found.length} new potential duplicate${found.length > 1 ? "s" : ""} found.`
              : "No new duplicates were found.",
            "scan",
          ),
        }));
        return found.length;
      },

      addRecord: (r) =>
        patch((s) => {
          const nextId = s.records.reduce((m, x) => Math.max(m, num(x.id)), 90000) + 1;
          const rec: RecordItem = { id: `REC-${nextId}`, ...r, status: "Unique", date: fmtDate() };
          return {
            records: [rec, ...s.records],
            log: logEntry(s, `added record ${rec.id} (${rec.name})`, r.source || "Manual", "import"),
          };
        }),
      updateRecord: (id, p) =>
        patch((s) => ({
          records: s.records.map((r) => (r.id === id ? { ...r, ...p } : r)),
          log: logEntry(s, `edited record ${id}`, "All Records", "settings"),
        })),
      deleteRecords: (ids) =>
        patch((s) => ({
          records: s.records.filter((r) => !ids.includes(r.id)),
          pairs: s.pairs.filter((p) => !ids.includes(p.master.id) && !ids.includes(p.duplicate.id)),
          log: logEntry(
            s,
            ids.length === 1 ? `deleted record ${ids[0]}` : `deleted ${ids.length} records`,
            "All Records",
            "warning",
          ),
        })),

      mergePair: (id) =>
        patch((s) => {
          const p = s.pairs.find((x) => x.id === id);
          if (!p) return {};
          return {
            pairs: s.pairs.filter((x) => x.id !== id),
            resolved: s.resolved + 1,
            records: s.records
              .filter((r) => r.id !== p.duplicate.id)
              .map((r) => (r.id === p.master.id ? { ...r, status: "Unique" } : r)),
            log: logEntry(s, `merged ${p.duplicate.id} into ${p.master.id}`, "Duplicate Detection", "merge"),
          };
        }),
      deletePairDuplicate: (id) =>
        patch((s) => {
          const p = s.pairs.find((x) => x.id === id);
          if (!p) return {};
          return {
            pairs: s.pairs.filter((x) => x.id !== id),
            resolved: s.resolved + 1,
            records: s.records.filter((r) => r.id !== p.duplicate.id),
            log: logEntry(s, `deleted duplicate record ${p.duplicate.id}`, "Duplicate Detection", "warning"),
          };
        }),
      dismissPair: (id) =>
        patch((s) => {
          const p = s.pairs.find((x) => x.id === id);
          if (!p) return {};
          return {
            pairs: s.pairs.filter((x) => x.id !== id),
            resolved: s.resolved + 1,
            dismissed: [...s.dismissed, pairKey(p.master.id, p.duplicate.id)],
            records: s.records.map((r) =>
              r.id === p.master.id || r.id === p.duplicate.id ? { ...r, status: "Unique" } : r,
            ),
            log: logEntry(
              s,
              `marked ${p.master.id} and ${p.duplicate.id} as not duplicates`,
              "Duplicate Detection",
              "settings",
            ),
          };
        }),

      addLog: (action, target, type) => patch((s) => ({ log: logEntry(s, action, target, type) })),
      clearLog: () => patch(() => ({ log: [] })),

      markRead: (id) =>
        patch((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllRead: () => patch((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      deleteNotification: (id) => patch((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
      clearNotifications: () => patch(() => ({ notifications: [] })),

      updateProfile: (p) => patch((s) => ({ profile: { ...s.profile, ...p } })),
      updatePrefs: (fn) => patch((s) => ({ prefs: fn(s.prefs) })),
      setPlan: (plan) =>
        patch((s) => ({
          plan,
          log: logEntry(s, `switched plan to ${plan}`, "Billing", "settings"),
        })),
      setTwoFA: (v) => patch(() => ({ twoFA: v })),
      revokeSession: (id) => patch((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),
      resetData: () => {
        const f = freshState();
        setState((s) => ({
          ...f,
          profile: s.profile,
          prefs: s.prefs,
          plan: s.plan,
          twoFA: s.twoFA,
          sessions: s.sessions,
        }));
        setSearchState({ query: "", status: "All" });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, page, signedIn, search, toasts, scanOpen, navigate, toast, dismissToast, patch],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
