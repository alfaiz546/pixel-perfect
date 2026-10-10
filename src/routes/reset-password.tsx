import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — KamConnect" },
      { name: "description", content: "Set a new password for your KamConnect account." },
      { property: "og:title", content: "Reset password — KamConnect" },
      { property: "og:description", content: "Set a new KamConnect password." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data } = supabase.auth.onAuthStateChange((e) => { if (e === "PASSWORD_RECOVERY") setOk(true); });
    supabase.auth.getSession().then(({ data }) => setOk(isRecovery || !!data.session));
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== fd.get("confirm")) return toast.error("Passwords do not match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    await supabase.auth.signOut({ scope: "others" });
    toast.success("Password updated!");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="bg-hero min-h-[70vh] px-5 py-12">
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 shadow-soft">
        <div className="flex justify-center"><Logo size={100} /></div>
        <h1 className="mt-4 text-center text-2xl font-extrabold text-primary">Set a new password</h1>
        {ok === false ? (
          <p className="mt-4 text-center text-sm text-muted-foreground">This reset link is invalid or has expired. Please request a new one from the log in page.</p>
        ) : (
          <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
            <Input name="password" type="password" placeholder="New password (8+ characters)" required />
            <Input name="confirm" type="password" placeholder="Confirm new password" required />
            <Button type="submit" variant="brand" disabled={busy || !ok}>{busy ? "Saving…" : "Update password"}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
