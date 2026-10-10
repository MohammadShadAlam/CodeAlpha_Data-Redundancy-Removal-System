import { cn } from "../utils/cn";
import {
  Shield,
  Grid,
  Database,
  Copy,
  CheckCircle,
  ClipboardList,
  Settings,
  LogOut,
  X,
  User,
  Bell,
} from "../icons";
import { useApp, type PageKey } from "../store";

type NavItem = { key: PageKey; label: string; icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement };

export const mainItems: NavItem[] = [
  { key: "overview", label: "Overview", icon: Grid },
  { key: "records", label: "All Records", icon: Database },
  { key: "duplicates", label: "Duplicate Detection", icon: Copy },
  { key: "validation", label: "Data Validation", icon: CheckCircle },
  { key: "logs", label: "Activity Logs", icon: ClipboardList },
  { key: "settings", label: "Settings", icon: Settings },
];

export const accountItems: NavItem[] = [
  { key: "profile", label: "My Profile", icon: User },
  { key: "notifications", label: "Notifications", icon: Bell },
];

export const navItems: { key: PageKey; label: string }[] = [
  ...mainItems,
  ...accountItems,
  { key: "plans", label: "Plans & Billing" },
];

export default function Sidebar({
  mobileOpen,
  onCloseMobile,
  onSignOut,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSignOut: () => void;
}) {
  const { page, navigate, notifications, plan } = useApp();
  const unread = notifications.filter((n) => !n.read).length;

  const go = (key: PageKey) => {
    navigate(key);
    onCloseMobile();
  };

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = page === item.key;
    return (
      <button
        key={item.key}
        onClick={() => go(item.key)}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
            : "text-slate-400 hover:bg-slate-900 hover:text-white",
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="truncate">{item.label}</span>
        {item.key === "notifications" && unread > 0 && (
          <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto bg-slate-950 p-5 transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between">
          <button onClick={() => go("overview")} className="flex items-center gap-3 text-left" aria-label="Go to overview">
            
<div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
  <img
    src="/dataguard-logo.png"
    alt="DataGuard Logo"
    className="h-full w-full object-contain"
  />
</div>

            <div className="leading-tight">
              <p className="text-base font-extrabold text-white">DataGuard</p>
              <p className="text-[11px] font-medium text-slate-400">Redundancy Removal</p>
            </div>
          </button>
          <button
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-8 flex-1 space-y-1">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Main Menu
          </p>
          {mainItems.map(renderItem)}
          <p className="px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Account
          </p>
          {accountItems.map(renderItem)}
        </nav>

        {/* Upgrade card */}
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 p-4 text-white">
          <p className="text-sm font-bold">Clean data, every day</p>
          <p className="mt-1 text-xs text-indigo-100">
            Automate deduplication across all your sources. You're on the{" "}
            <span className="font-semibold capitalize">{plan}</span> plan.
          </p>
          <button
            onClick={() => go("plans")}
            className="mt-3 w-full rounded-lg bg-white/15 py-2 text-xs font-semibold backdrop-blur hover:bg-white/25"
          >
            View plan
          </button>
        </div>

        <button
          onClick={onSignOut}
          className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </aside>
    </>
  );
}
