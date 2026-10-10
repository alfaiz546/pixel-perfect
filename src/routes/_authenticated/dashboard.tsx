import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { PROFESSIONS } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — KamConnect" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

function Dashboard() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const id = u.user!.id;
      const [p, w, r] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
        supabase.from("workers").select("*").eq("user_id", id).maybeSingle(),
        supabase.from("hire_requests").select("*").order("created_at", { ascending: false }),
      ]);
      return { id, profile: p.data, worker: w.data, requests: r.data ?? [] };
    },
  });
  const [busy, setBusy] = useState(false);
  if (!data) return <p className="p-20 text-center">Loading…</p>;
  const { id, profile, worker, requests } = data;

  async function uploadAvatar(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { toast.error("Use a JPG, PNG or WebP image"); return; }
    if (file.size > 3 * 1024 * 1024) { toast.error("Image must be under 3 MB"); return; }
    const path = `${id}/${crypto.randomUUID()}.${file.type.split("/")[1]}`;
    const up = await supabase.storage.from("avatars").upload(path, file);
    if (up.error) { toast.error(up.error.message); return; }
    const { data: s } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
    const url = s?.signedUrl ?? null;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", id);
    if (worker) await supabase.from("workers").update({ avatar_url: url }).eq("id", worker.id);
    toast.success("Photo updated");
    qc.invalidateQueries();
  }

  async function saveWorker(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const row = {
      user_id: id,
      name: (fd["name"] ?? "").trim().slice(0, 100),
      skill: fd["skill"] ?? "Electrician",
      city: (fd["city"] ?? "").trim().slice(0, 60),
      area: (fd["area"] ?? "").trim().slice(0, 60),
      experience_years: Math.max(0, Math.min(60, Number(fd["experience_years"]) || 0)),
      rate: (fd["rate"] ?? "").slice(0, 30),
      tags: (fd["tags"] ?? "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 10),
      languages: (fd["languages"] ?? "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8),
      about: (fd["about"] ?? "").slice(0, 1000),
      team_available: fd["team_available"] === "on",
      avatar_url: profile?.avatar_url ?? null,
    };
    if (!row.name || !row.city) { toast.error("Name and city are required"); return; }
    setBusy(true);
    const { error } = worker
      ? await supabase.from("workers").update(row).eq("id", worker.id)
      : await supabase.from("workers").insert(row);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved");
    qc.invalidateQueries();
  }

  async function setStatus(rid: string, status: string) {
    const { error } = await supabase.from("hire_requests").update({ status }).eq("id", rid);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["me"] });
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="flex items-center gap-4">
        <Logo size={64} />
        <div>
          <h1 className="text-3xl font-extrabold text-primary">Namaste, {profile?.full_name || "friend"}</h1>
          <p className="text-muted-foreground">{profile?.account_type === "worker" ? "Worker" : "Hirer"} dashboard</p>
        </div>
      </div>

      <section className="mt-8 flex items-center gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft">
        {profile?.avatar_url ? <img src={profile.avatar_url} alt="Your photo" className="size-20 rounded-2xl object-cover" /> : <div className="size-20 rounded-2xl bg-brand-soft" />}
        <label className="cursor-pointer text-sm font-bold text-brand">
          Upload profile picture
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
        </label>
      </section>

      {profile?.account_type === "worker" && (
        <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-primary">Your skill profile</h2>
          <form onSubmit={saveWorker} className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input name="name" placeholder="Name" defaultValue={worker?.name ?? profile.full_name} required />
            <select name="skill" className={sel} defaultValue={worker?.skill ?? "Electrician"}>{PROFESSIONS.map((p) => <option key={p}>{p}</option>)}</select>
            <Input name="city" placeholder="City" defaultValue={worker?.city ?? ""} required />
            <Input name="area" placeholder="Service area" defaultValue={worker?.area ?? ""} />
            <Input name="experience_years" type="number" placeholder="Years of experience" defaultValue={worker?.experience_years ?? 0} />
            <Input name="rate" placeholder="Rate (e.g. ₹500+)" defaultValue={worker?.rate ?? ""} />
            <Input name="tags" placeholder="Skills, comma separated" defaultValue={worker?.tags.join(", ") ?? ""} />
            <Input name="languages" placeholder="Languages, comma separated" defaultValue={worker?.languages.join(", ") ?? ""} />
            <Textarea name="about" className="sm:col-span-2" placeholder="About your work" defaultValue={worker?.about ?? ""} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="team_available" defaultChecked={worker?.team_available} /> Available for team projects</label>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" variant="brand" disabled={busy}>{busy ? "Saving…" : "Save profile"}</Button>
              {worker && <Button asChild variant="outline"><Link to="/workers/$id" params={{ id: worker.id }}>View skill passport</Link></Button>}
            </div>
          </form>
        </section>
      )}

      <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-primary">Hiring requests</h2><Button asChild size="sm"><Link to="/hire">New request</Link></Button></div>
        <div className="mt-4 flex flex-col gap-3">
          {requests.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted p-4">
              <div><b>{r.title}</b><div className="text-xs text-muted-foreground">{r.kind} • {r.city} • {new Date(r.created_at).toLocaleDateString()}</div></div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold capitalize text-brand">{r.status}</span>
                {r.hirer_id === id && r.status === "pending" && <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "cancelled")}>Cancel</Button>}
                {r.hirer_id !== id && r.status === "pending" && <Button size="sm" variant="brand" onClick={() => setStatus(r.id, "accepted")}>Accept</Button>}
              </div>
            </div>
          ))}
          {requests.length === 0 && <p className="text-sm text-muted-foreground">No requests yet.</p>}
        </div>
      </section>
    </div>
  );
}
