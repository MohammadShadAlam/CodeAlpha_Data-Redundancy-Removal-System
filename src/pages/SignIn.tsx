import { useState } from "react";
import { Shield, Eye, EyeOff, Info } from "../icons";
import { Button, Field } from "../components/ui";
import { useApp } from "../store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignIn() {
  const { signIn, toast, profile } = useApp();
  const [email, setEmail] = useState(profile.email);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [resetSent, setResetSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return;
    signIn();
    toast(`Welcome back, ${profile.name.split(" ")[0]}!`);
  };

  const forgot = () => {
    if (!EMAIL_RE.test(email.trim())) {
      setErrors({ email: "Enter your email first so we know where to send the link." });
      return;
    }
    setErrors({});
    setResetSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md animate-fade-up rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Shield className="h-6 w-6" />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">DataGuard</p>
            <p className="text-xs font-medium text-slate-400">Redundancy Removal</p>
          </div>
        </div>

        <h1 className="mt-8 text-2xl font-extrabold text-slate-900 dark:text-white">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Welcome back. Enter your details to continue.
        </p>

        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="name@company.com"
          />
          <div>
            <div className="relative">
              <Field
                label="Password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3 top-[34px] rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={forgot}
              className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Forgot password?
            </button>
          </div>

          {resetSent && (
            <p role="status" className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              If an account exists for {email}, a reset link is on its way.
            </p>
          )}

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 flex items-start gap-2 rounded-xl bg-indigo-50 px-3.5 py-2.5 text-xs text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          This is a prototype — any valid email and a non-empty password will sign you in.
        </p>
      </div>
    </div>
  );
}
