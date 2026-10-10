import { useMemo, useRef, useState } from "react";
import { Card, Button, Badge, Avatar, Field, Modal, Toggle } from "../components/ui";
import { Camera, Trash, Monitor, Lock, Mail, Shield, Clock } from "../icons";
import { useApp, type Profile as ProfileData } from "../store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Crop to a centred square and shrink so it fits comfortably in localStorage. */
function fileToAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        const side = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function PasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast, addLog } = useApp();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const close = () => {
    setCur("");
    setNext("");
    setConfirm("");
    setErrors({});
    onClose();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!cur) er.cur = "Enter your current password.";
    if (next.length < 8) er.next = "Use at least 8 characters.";
    else if (!/\d/.test(next) || !/[a-zA-Z]/.test(next)) er.next = "Include both letters and numbers.";
    else if (next === cur) er.next = "New password must differ from the current one.";
    if (confirm !== next) er.confirm = "Passwords do not match.";
    setErrors(er);
    if (Object.keys(er).length) return;
    addLog("changed account password", "Security", "settings");
    toast("Password updated");
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Change password"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="password-form">
            Update password
          </Button>
        </>
      }
    >
      <form id="password-form" onSubmit={submit} noValidate className="space-y-4">
        <Field label="Current password" type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} error={errors.cur} />
        <Field label="New password" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} error={errors.next} />
        <Field label="Confirm new password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
      </form>
    </Modal>
  );
}

export default function Profile() {
  const {
    profile, updateProfile, toast, log, records, plan, navigate,
    twoFA, setTwoFA, sessions, revokeSession, addLog,
  } = useApp();

  const [form, setForm] = useState<ProfileData>(profile);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [pwOpen, setPwOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = useMemo(
    () => (Object.keys(form) as (keyof ProfileData)[]).some((k) => k !== "avatar" && form[k] !== profile[k]),
    [form, profile],
  );

  const mine = log.filter((l) => l.mine || l.actor === "Kacie Velasquez");
  const merges = mine.filter((l) => l.type === "merge").length;
  const set = (k: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const er: typeof errors = {};
    if (!form.name.trim()) er.name = "Name is required.";
    if (!EMAIL_RE.test(form.email.trim())) er.email = "Enter a valid email address.";
    setErrors(er);
    if (Object.keys(er).length) return;
    updateProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role.trim(),
      team: form.team.trim(),
      location: form.location.trim(),
      bio: form.bio.trim(),
    });
    addLog("updated profile details", "My Profile", "settings");
    toast("Profile saved");
  };

  const cancel = () => {
    setForm(profile);
    setErrors({});
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast("Please choose an image file.", "error");
    if (file.size > 5 * 1024 * 1024) return toast("Image must be smaller than 5 MB.", "error");
    try {
      const avatar = await fileToAvatar(file);
      updateProfile({ avatar });
      toast("Profile photo updated");
    } catch {
      toast("Couldn't read that image. Try another one.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your personal details, security and account activity.
        </p>
      </div>

      {/* Header card */}
      <Card className="overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-indigo-600 to-indigo-400" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative w-fit">
              <Avatar
                name={profile.name}
                src={profile.avatar}
                className="h-24 w-24 text-2xl ring-4 ring-white dark:ring-slate-900"
              />
              <button
                onClick={() => fileRef.current?.click()}
                aria-label="Upload profile photo"
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} data-testid="avatar-input" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-extrabold text-slate-900 dark:text-white">{profile.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {profile.role} · {profile.team}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="indigo" className="capitalize">{plan} plan</Badge>
                <Badge tone={twoFA ? "emerald" : "amber"}>2FA {twoFA ? "enabled" : "off"}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => fileRef.current?.click()}>
                <Camera className="h-4 w-4" /> Change photo
              </Button>
              {profile.avatar && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    updateProfile({ avatar: null });
                    toast("Profile photo removed", "info");
                  }}
                >
                  <Trash className="h-4 w-4" /> Remove
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: "Actions logged", value: mine.length },
              { label: "Merges completed", value: merges },
              { label: "Records managed", value: records.length },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Personal info */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal information</h2>
          <form onSubmit={save} noValidate className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" value={form.name} onChange={set("name")} error={errors.name} />
              <Field label="Email" type="email" value={form.email} onChange={set("email")} error={errors.email} />
              <Field label="Phone" value={form.phone} onChange={set("phone")} />
              <Field label="Location" value={form.location} onChange={set("location")} />
              <Field label="Role" value={form.role} onChange={set("role")} />
              <Field label="Team" value={form.team} onChange={set("team")} />
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Bio</span>
              <textarea
                rows={3}
                maxLength={240}
                value={form.bio}
                onChange={set("bio")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <span className="mt-1 block text-right text-xs text-slate-400">{form.bio.length}/240</span>
            </label>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={cancel} disabled={!dirty}>
                Cancel
              </Button>
              <Button type="submit" disabled={!dirty}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <Lock className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Password</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Last changed 3 months ago</p>
              </div>
              <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setPwOpen(true)}>
                Change
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Shield className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Two-factor authentication</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Extra protection at sign-in</p>
              </div>
              <Toggle
                checked={twoFA}
                label="Two-factor authentication"
                onChange={(v) => {
                  setTwoFA(v);
                  addLog(`${v ? "enabled" : "disabled"} two-factor authentication`, "Security", "settings");
                  toast(`Two-factor authentication ${v ? "enabled" : "disabled"}`, v ? "success" : "info");
                }}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
                <Mail className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Email</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{profile.email}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sessions */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active sessions</h2>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <Monitor className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {s.device} {s.current && <Badge tone="emerald" className="ml-1">This device</Badge>}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.place} · {s.when}</p>
                </div>
                {!s.current && (
                  <Button
                    variant="ghost"
                    className="px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400"
                    onClick={() => {
                      revokeSession(s.id);
                      toast(`Signed out ${s.device}`, "info");
                    }}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
            {sessions.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No active sessions.</p>}
          </div>
        </Card>

        {/* My activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">My recent activity</h2>
            <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => navigate("logs")}>
              View all
            </Button>
          </div>
          <ul className="mt-4 space-y-3">
            {mine.slice(0, 5).map((l, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <Clock className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-200">You {l.action}</p>
                  <p className="text-xs text-slate-400">{l.target} · {l.date}, {l.time}</p>
                </div>
              </li>
            ))}
            {mine.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No activity yet.</p>}
          </ul>
        </Card>
      </div>

      <PasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </div>
  );
}
