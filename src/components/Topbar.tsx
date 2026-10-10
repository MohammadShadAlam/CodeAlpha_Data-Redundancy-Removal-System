import { useState } from "react";
import { Search, Bell, Menu, ChevronDown, X, Sun, Moon, User, Settings, CreditCard, LogOut } from "../icons";
import { Avatar, useDismiss } from "./ui";
import { navItems } from "./Sidebar";
import { useApp } from "../store";
import { useTheme } from "../theme";

export default function Topbar({
  onOpenMobile,
  onSignOut,
}: {
  onOpenMobile: () => void;
  onSignOut: () => void;
}) {
  const { page, navigate, profile, search, setSearch, notifications, markRead, markAllRead } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const bellRef = useDismiss(bellOpen, () => setBellOpen(false));
  const menuRef = useDismiss(menuOpen, () => setMenuOpen(false));

  const title = navItems.find((n) => n.key === page)?.label ?? "Overview";
  const unread = notifications.filter((n) => !n.read).length;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch({ status: "All" });
    navigate("records");
  };

  const item =
    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/60";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/70">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          onClick={onOpenMobile}
          aria-label="Open menu"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden lg:block">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">DataGuard</p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</p>
        </div>

        {/* Search */}
        <form onSubmit={submitSearch} role="search" className="relative ml-auto w-full max-w-md lg:ml-6">
          <button
            type="submit"
            aria-label="Search"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-indigo-600"
          >
            <Search className="h-4.5 w-4.5" />
          </button>
          <input
            value={search.query}
            onChange={(e) => setSearch({ query: e.target.value })}
            placeholder="Search records, emails, sources..."
            aria-label="Search records"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:bg-slate-900"
          />
          {search.query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch({ query: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Theme */}
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => {
                setBellOpen((o) => !o);
                setMenuOpen(false);
              }}
              aria-label="Notifications"
              aria-expanded={bellOpen}
              className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
            {bellOpen && (
              <div className="fixed left-4 right-4 top-16 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800 sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-96">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Notifications{unread > 0 && <span className="ml-2 text-xs font-semibold text-rose-500">{unread} new</span>}
                  </p>
                  <button
                    onClick={markAllRead}
                    disabled={unread === 0}
                    className="text-xs font-semibold text-indigo-600 hover:underline disabled:opacity-40 disabled:no-underline dark:text-indigo-400"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.slice(0, 5).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        markRead(n.id);
                        setBellOpen(false);
                        navigate("notifications");
                      }}
                      className="flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-700/40"
                    >
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-indigo-500"}`} />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{n.title}</span>
                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{n.body}</span>
                        <span className="mt-0.5 block text-[11px] text-slate-400">{n.time}</span>
                      </span>
                    </button>
                  ))}
                  {notifications.length === 0 && (
                    <p className="px-4 py-10 text-center text-sm text-slate-400">You're all caught up.</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setBellOpen(false);
                    navigate("notifications");
                  }}
                  className="w-full border-t border-slate-100 py-3 text-center text-sm font-semibold text-indigo-600 hover:bg-slate-50 dark:border-slate-700 dark:text-indigo-400 dark:hover:bg-slate-700/40"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>

          {/* Profile menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                setMenuOpen((o) => !o);
                setBellOpen(false);
              }}
              aria-label="Account menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 sm:gap-3"
            >
              <Avatar name={profile.name} src={profile.avatar} className="h-8 w-8" />
              <div className="hidden text-left leading-tight sm:block">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{profile.name}</p>
                <p className="text-[11px] text-slate-400">{profile.role}</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{profile.name}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{profile.email}</p>
                </div>
                <button className={item} onClick={() => { setMenuOpen(false); navigate("profile"); }}>
                  <User className="h-4 w-4" /> My Profile
                </button>
                <button className={item} onClick={() => { setMenuOpen(false); navigate("settings"); }}>
                  <Settings className="h-4 w-4" /> Settings
                </button>
                <button className={item} onClick={() => { setMenuOpen(false); navigate("plans"); }}>
                  <CreditCard className="h-4 w-4" /> Plans &amp; Billing
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                <button
                  className={`${item} text-rose-600 dark:text-rose-400`}
                  onClick={() => { setMenuOpen(false); onSignOut(); }}
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
