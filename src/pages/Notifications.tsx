import { useState } from "react";
import { Card, Button, Badge, ConfirmModal } from "../components/ui";
import { Copy, Zap, AlertTriangle, Bell, Check, Trash, Inbox } from "../icons";
import { useApp, type NotificationItem } from "../store";

const meta: Record<NotificationItem["type"], { Icon: any; color: string }> = {
  duplicate: { Icon: Copy, color: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" },
  scan: { Icon: Zap, color: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400" },
  warning: { Icon: AlertTriangle, color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
  system: { Icon: Bell, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" },
};

export default function Notifications() {
  const { notifications, markRead, markAllRead, deleteNotification, clearNotifications, navigate, setSearch, toast } = useApp();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [clearOpen, setClearOpen] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;
  const list = tab === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const act = (n: NotificationItem) => {
    markRead(n.id);
    if (n.type === "duplicate") navigate("duplicates");
    else if (n.type === "warning") {
      setSearch({ status: "Warning", query: "" });
      navigate("records");
    } else if (n.type === "scan") navigate("overview");
  };

  const actionLabel = (t: NotificationItem["type"]) =>
    t === "duplicate" ? "Review duplicates" : t === "warning" ? "View warnings" : t === "scan" ? "View overview" : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Alerts about duplicates, scans and validation issues.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={unread === 0}
            onClick={() => {
              markAllRead();
              toast("All notifications marked as read");
            }}
          >
            <Check className="h-4 w-4" /> Mark all read
          </Button>
          <Button variant="secondary" disabled={notifications.length === 0} onClick={() => setClearOpen(true)}>
            <Trash className="h-4 w-4" /> Clear all
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {(["all", "unread"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
              tab === t
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {t}
            {t === "unread" && unread > 0 ? ` (${unread})` : ""}
          </button>
        ))}
      </div>

      <Card className="divide-y divide-slate-100 overflow-hidden dark:divide-slate-800">
        {list.map((n) => {
          const m = meta[n.type];
          const label = actionLabel(n.type);
          return (
            <div key={n.id} className={`flex gap-4 p-5 ${n.read ? "" : "bg-indigo-50/40 dark:bg-indigo-500/5"}`}>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${m.color}`}>
                <m.Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{n.title}</p>
                  {!n.read && <Badge tone="indigo">New</Badge>}
                </div>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{n.body}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="text-xs text-slate-400">{n.time}</span>
                  {label && (
                    <button
                      onClick={() => act(n)}
                      className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {label}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-1">
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    aria-label="Mark as read"
                    title="Mark as read"
                    className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    deleteNotification(n.id);
                    toast("Notification deleted", "info");
                  }}
                  aria-label="Delete notification"
                  title="Delete"
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-700"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <Inbox className="h-6 w-6" />
            </span>
            <p className="mt-3 font-semibold text-slate-700 dark:text-slate-200">
              {tab === "unread" ? "No unread notifications" : "No notifications"}
            </p>
            <p className="text-sm text-slate-400">You're all caught up.</p>
          </div>
        )}
      </Card>

      <ConfirmModal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={() => {
          clearNotifications();
          toast("All notifications cleared", "info");
        }}
        title="Clear all notifications"
        message="This will permanently remove every notification. Continue?"
        confirmLabel="Clear all"
        danger
      />
    </div>
  );
}
