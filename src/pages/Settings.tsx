import { useState } from "react";
import { Card, Button, Avatar, Badge, Toggle, ConfirmModal } from "../components/ui";
import { Sun, Moon, CheckCircle, Download, Trash, Refresh, User } from "../icons";
import { useTheme } from "../theme";
import { useApp } from "../store";
import { downloadCsv } from "../utils/csv";

const tabs = ["Appearance", "Profile", "Notifications", "Detection", "Data"];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { profile, prefs, updatePrefs, records, resetData, clearLog, navigate, toast } = useApp();
  const [tab, setTab] = useState("Appearance");
  const [resetOpen, setResetOpen] = useState(false);
  const notif = prefs.notif;
  const detection = prefs.detection;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your preferences, appearance, and detection behavior.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Appearance" && (
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Appearance</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Choose how DataGuard looks. Your choice is saved to this browser.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Light */}
            <button
              onClick={() => setTheme("light")}
              className={`group rounded-2xl border-2 p-4 text-left transition-all ${
                theme === "light"
                  ? "border-indigo-600 ring-2 ring-indigo-600/15"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
              }`}
            >
              <div className="mb-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex h-24 bg-slate-100">
                  <div className="w-1/4 bg-slate-900" />
                  <div className="flex-1 p-2">
                    <div className="mb-1.5 h-2 w-12 rounded bg-slate-300" />
                    <div className="h-8 rounded bg-white shadow-sm" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                  <Sun className="h-4 w-4" /> Light
                </span>
                {theme === "light" && <CheckCircle className="h-5 w-5 text-indigo-600" />}
              </div>
            </button>

            {/* Dark */}
            <button
              onClick={() => setTheme("dark")}
              className={`group rounded-2xl border-2 p-4 text-left transition-all ${
                theme === "dark"
                  ? "border-indigo-600 ring-2 ring-indigo-600/15"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
              }`}
            >
              <div className="mb-3 overflow-hidden rounded-xl border border-slate-700">
                <div className="flex h-24 bg-slate-950">
                  <div className="w-1/4 bg-black" />
                  <div className="flex-1 p-2">
                    <div className="mb-1.5 h-2 w-12 rounded bg-slate-700" />
                    <div className="h-8 rounded bg-slate-800" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                  <Moon className="h-4 w-4" /> Dark
                </span>
                {theme === "dark" && <CheckCircle className="h-5 w-5 text-indigo-600" />}
              </div>
            </button>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50/70 p-4 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-indigo-500" />
              ) : (
                <Sun className="h-5 w-5 text-amber-500" />
              )}
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Dark mode is {theme === "dark" ? "on" : "off"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Toggle to instantly switch the entire interface.
                </p>
              </div>
            </div>
            <Toggle checked={theme === "dark"} onChange={(v) => setTheme(v ? "dark" : "light")} />
          </div>
        </Card>
      )}

      {tab === "Profile" && (
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile</h2>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar name={profile.name} src={profile.avatar} className="h-16 w-16 text-lg" />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-800 dark:text-slate-100">{profile.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{profile.role} · {profile.team}</p>
              <p className="truncate text-sm text-slate-400">{profile.email}</p>
            </div>
            <Button onClick={() => navigate("profile")}>
              <User className="h-4 w-4" /> Edit profile
            </Button>
          </div>
          <p className="mt-5 rounded-xl bg-indigo-50 px-3.5 py-2.5 text-xs text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            Update your photo, details, password and security options on your profile page.
          </p>
        </Card>
      )}

      {tab === "Notifications" && (
        <Card className="divide-y divide-slate-100 p-2 dark:divide-slate-800">
          {[
            { key: "email", title: "Email notifications", desc: "Receive important alerts via email." },
            { key: "duplicates", title: "Duplicate alerts", desc: "Notify me when new duplicates are detected." },
            { key: "weekly", title: "Weekly quality report", desc: "A summary of data health every Monday." },
          ].map((n) => (
            <div key={n.key} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{n.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{n.desc}</p>
              </div>
              <Toggle
                label={n.title}
                checked={(notif as any)[n.key]}
                onChange={(v) => {
                  updatePrefs((p) => ({ ...p, notif: { ...p.notif, [n.key]: v } }));
                  toast(`${n.title} ${v ? "on" : "off"}`, "info");
                }}
              />
            </div>
          ))}
        </Card>
      )}

      {tab === "Detection" && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Detection Preferences</h2>
            <Badge tone="indigo">Prototype</Badge>
          </div>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { key: "auto", title: "Auto-merge high confidence", desc: "Automatically merge matches above 95%." },
              { key: "fuzzy", title: "Fuzzy name matching", desc: "Catch typos and formatting variations." },
              { key: "strict", title: "Strict mode", desc: "Require manual approval for all merges." },
            ].map((d) => (
              <div key={d.key} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{d.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{d.desc}</p>
                </div>
                <Toggle
                  label={d.title}
                  checked={(detection as any)[d.key]}
                  onChange={(v) => {
                    updatePrefs((p) => ({ ...p, detection: { ...p.detection, [d.key]: v } }));
                    toast(`${d.title} ${v ? "on" : "off"}`, "info");
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-5">
            <label htmlFor="threshold" className="mb-1.5 flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
              <span>Match confidence threshold</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{prefs.threshold}%</span>
            </label>
            <input
              id="threshold"
              type="range"
              min={50}
              max={100}
              value={prefs.threshold}
              onChange={(e) => updatePrefs((p) => ({ ...p, threshold: Number(e.target.value) }))}
              className="w-full accent-indigo-600"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </Card>
      )}

      {tab === "Data" && (
        <Card className="divide-y divide-slate-100 p-2 dark:divide-slate-800">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Export all records</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Download every record as a CSV file.</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                downloadCsv("dataguard-all-records.csv", records as unknown as Record<string, unknown>[], [
                  "id", "name", "email", "phone", "source", "status", "date",
                ]);
                toast(`Exported ${records.length} records`);
              }}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Clear activity log</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Remove every entry from the activity log.</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                clearLog();
                toast("Activity log cleared", "info");
              }}
            >
              <Trash className="h-4 w-4" /> Clear log
            </Button>
          </div>
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Reset sample data</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Restore the original records, duplicate matches, activity and notifications.
              </p>
            </div>
            <Button variant="danger" onClick={() => setResetOpen(true)}>
              <Refresh className="h-4 w-4" /> Reset data
            </Button>
          </div>
        </Card>
      )}

      <ConfirmModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetData();
          toast("Sample data restored");
        }}
        title="Reset sample data"
        message="Your changes to records, duplicates, activity and notifications will be replaced with the original sample data. Your profile and preferences are kept."
        confirmLabel="Reset"
        danger
      />
    </div>
  );
}
