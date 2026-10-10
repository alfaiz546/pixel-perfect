import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Logo } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ mode: z.enum(["login", "signup", "forgot"]).optional() }),
  head: () => ({
    meta: [
      { title: "Log in or Sign up — KamConnect" },
      { name: "description", content: "Create your KamConnect account as a worker or hirer, or log in." },
      { property: "og:title", content: "Log in or Sign up — KamConnect" },
      { property: "og:description", content: "Join KamConnect as a skilled worker or hirer." },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().regex(/^[0-9+\- ]{0,15}$/, "Enter a valid mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  confirm: z.string(),
  account_type: z.enum(["worker", "hirer"]),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++; if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

function AuthPage() {
  const search = Route.useSearch();
  const [mode, setMode] = useState(search.mode ?? "login");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState("");
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const { user } = useSession();

  useEffect(() => { setMode(search.mode ?? "login"); }, [search.mode]);
  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function onSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = signupSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
    const { email, password, full_name, phone, account_type } = parsed.data;
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name, phone, account_type } },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setVerifyEmail(email);
    setCooldown(60);
  }

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: String(fd.get("email")), password: String(fd.get("password")) });
    setBusy(false);
    if (error) {
      if (error.message.toLowerCase().includes("confirm")) { setVerifyEmail(String(fd.get("email"))); return toast.error("Please verify your email first."); }
      { toast.error("Incorrect email or password."); return; }
    }
    toast.success("Welcome back!");
  }

  async function onVerify() {
    if (!verifyEmail || code.length !== 6) return;
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email: verifyEmail, token: code, type: "signup" });
    setBusy(false);
    if (error) { toast.error("That code is invalid or has expired."); return; }
    toast.success("Email verified!");
  }

  async function resend() {
    if (!verifyEmail || cooldown > 0) return;
    const { error } = await supabase.auth.resend({ type: "signup", email: verifyEmail, options: { emailRedirectTo: `${window.location.origin}/dashboard` } });
    if (error) { toast.error(error.message); return; }
    setCooldown(60);
    toast.success("A new email is on its way.");
  }

  async function onForgot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email"));
    if (!z.string().email().safeParse(email).success) { toast.error("Enter a valid email"); return; }
    setBusy(true);
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false);
    setResetSent(true);
    setCooldown(60);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Google sign-in failed.");
  }

  const s = strength(pw);

  return (
    <div className="bg-hero min-h-[80vh] px-5 py-12">
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 shadow-soft">
        <div className="flex justify-center"><Logo size={110} /></div>

        {verifyEmail ? (
          <div className="mt-4 text-center">
            <h1 className="text-2xl font-extrabold text-primary">Verify your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">We sent a confirmation email to <b>{verifyEmail}</b>. Click the link in it, or enter the 6-digit code if one is included.</p>
            <div className="mt-6 flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>{[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
              </InputOTP>
            </div>
            <Button className="mt-5 w-full" variant="brand" disabled={busy || code.length !== 6} onClick={onVerify}>{busy ? "Verifying…" : "Verify"}</Button>
            <button className="mt-4 text-sm font-semibold text-brand disabled:text-muted-foreground" disabled={cooldown > 0} onClick={resend}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
            </button>
            <button className="mt-2 block w-full text-xs text-muted-foreground" onClick={() => setVerifyEmail(null)}>Use a different email</button>
          </div>
        ) : mode === "forgot" ? (
          <div className="mt-4">
            <h1 className="text-center text-2xl font-extrabold text-primary">Forgot password?</h1>
            {resetSent ? (
              <p className="mt-4 text-center text-sm text-muted-foreground">If an account exists for that email, a reset link is on its way. The link expires after a short time.</p>
            ) : null}
            <form onSubmit={onForgot} className="mt-6 flex flex-col gap-3">
              <Input name="email" type="email" placeholder="Your email" required />
              <Button type="submit" variant="brand" disabled={busy || cooldown > 0}>{cooldown > 0 ? `Send again in ${cooldown}s` : busy ? "Sending…" : "Send reset link"}</Button>
            </form>
            <button className="mt-4 w-full text-sm font-semibold text-brand" onClick={() => setMode("login")}>Back to log in</button>
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 rounded-xl bg-muted p-1">
              {(["login", "signup"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} className={`rounded-lg py-2 text-sm font-bold ${mode === m ? "bg-card text-primary shadow-soft" : "text-muted-foreground"}`}>
                  {m === "login" ? "Log in" : "Sign up"}
                </button>
              ))}
            </div>
            <Button variant="outline" className="mt-5 w-full" onClick={google}>Continue with Google</Button>
            <div className="my-4 text-center text-xs text-muted-foreground">or with email</div>
            {mode === "login" ? (
              <form onSubmit={onLogin} className="flex flex-col gap-3">
                <Input name="email" type="email" placeholder="Email" required />
                <PasswordInput name="password" show={show} setShow={setShow} placeholder="Password" />
                <button type="button" className="self-end text-sm font-semibold text-brand" onClick={() => setMode("forgot")}>Forgot Password?</button>
                <Button type="submit" disabled={busy}>{busy ? "Logging in…" : "Log in"}</Button>
              </form>
            ) : (
              <form onSubmit={onSignup} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                  {(["worker", "hirer"] as const).map((t) => (
                    <label key={t} className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                      <input type="radio" name="account_type" value={t} defaultChecked={t === "worker"} />
                      {t === "worker" ? "I'm a worker" : "I want to hire"}
                    </label>
                  ))}
                </div>
                <Input name="full_name" placeholder="Full name" required />
                <Input name="email" type="email" placeholder="Email" required />
                <Input name="phone" type="tel" placeholder="Mobile number (optional)" />
                <PasswordInput name="password" show={show} setShow={setShow} placeholder="Password (8+ characters)" onChange={setPw} />
                <div className="flex gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 flex-1 rounded ${i < s ? (s >= 3 ? "bg-brand" : "bg-lime") : "bg-muted"}`} />)}</div>
                <p className="text-xs text-muted-foreground">Use upper & lower case, a number and a symbol for a strong password.</p>
                <PasswordInput name="confirm" show={show} setShow={setShow} placeholder="Confirm password" />
                <Button type="submit" variant="brand" disabled={busy}>{busy ? "Creating account…" : "Create account"}</Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PasswordInput({ name, show, setShow, placeholder, onChange }: { name: string; show: boolean; setShow: (b: boolean) => void; placeholder: string; onChange?: (v: string) => void }) {
  return (
    <div className="relative">
      <Input name={name} type={show ? "text" : "password"} placeholder={placeholder} required onChange={(e) => onChange?.(e.target.value)} />
      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
