import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { PROFESSIONS, workersQuery } from "@/lib/data";

export const Route = createFileRoute("/hire")({
  validateSearch: z.object({ tab: z.enum(["individual", "team"]).optional(), worker: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Hire Professionals — KamConnect" },
      { name: "description", content: "Hire one skilled worker or a full team for your home, shop or construction project." },
      { property: "og:title", content: "Hire Professionals — KamConnect" },
      { property: "og:description", content: "Individual and team hiring for skilled trades." },
    ],
  }),
  component: HirePage,
});

const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
const base = z.object({
  title: z.string().trim().min(3, "Add a short title").max(120),
  description: z.string().trim().max(1500),
  city: z.string().trim().min(2, "Add a city").max(60),
  preferred_date: z.string().optional(),
  budget: z.string().trim().max(40),
});

function HirePage() {
  const search = Route.useSearch();
  const [tab, setTab] = useState(search.tab ?? "individual");
  const [roles, setRoles] = useState([{ skill: "Mason", count: 2 }]);
  const [busy, setBusy] = useState(false);
  const { user } = useSession();
  const { data: workers = [] } = useQuery(workersQuery);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = base.safeParse(fd);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
    setBusy(true);
    const { error } = await supabase.from("hire_requests").insert({
      ...parsed.data,
      preferred_date: parsed.data.preferred_date || null,
      hirer_id: user.id,
      kind: tab,
      worker_id: tab === "individual" && fd["worker_id"] ? fd["worker_id"] : null,
      roles: tab === "team" ? roles : [],
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Request sent! Track it in your dashboard.");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-4xl font-extrabold text-primary">Hire professionals</h1>
      <p className="text-muted-foreground">काम दें — one worker or a full team</p>
      <div className="mt-6 inline-flex rounded-xl bg-muted p-1">
        {(["individual", "team"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-5 py-2 text-sm font-bold ${tab === t ? "bg-card text-primary shadow-soft" : "text-muted-foreground"}`}>
            {t === "individual" ? "Individual" : "Group / Team"}
          </button>
        ))}
      </div>
      {!user ? (
        <div className="mt-8 rounded-3xl border border-border p-8 text-center">
          <p className="text-muted-foreground">Sign in to send a hiring request and track its status.</p>
          <Button asChild className="mt-4"><Link to="/auth" search={{ mode: "login" }}>Sign in to hire</Link></Button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
          <Input name="title" placeholder={tab === "team" ? "Project title (e.g. 3BHK renovation)" : "Task title (e.g. Fix ceiling fan)"} required />
          <Textarea name="description" placeholder="Describe the work, schedule and duration" />
          {tab === "individual" ? (
            <select name="worker_id" className={sel} defaultValue={search.worker ?? ""}>
              <option value="">Any available worker</option>
              {workers.map((w) => <option key={w.id} value={w.id}>{w.name} — {w.skill}, {w.city}</option>)}
            </select>
          ) : (
            <div className="flex flex-col gap-2">
              <b className="text-sm">Required professions</b>
              {roles.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <select className={sel} value={r.skill} onChange={(e) => setRoles(roles.map((x, j) => j === i ? { ...x, skill: e.target.value } : x))}>
                    {PROFESSIONS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <Input type="number" min={1} max={50} className="w-24" value={r.count} onChange={(e) => setRoles(roles.map((x, j) => j === i ? { ...x, count: Math.max(1, +e.target.value) } : x))} />
                  <Button type="button" variant="ghost" size="icon" disabled={roles.length === 1} onClick={() => setRoles(roles.filter((_, j) => j !== i))} aria-label="Remove role"><Trash2 /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setRoles([...roles, { skill: "Painter", count: 1 }])}><Plus /> Add profession</Button>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <Input name="city" placeholder="City / area" required />
            <Input name="preferred_date" type="date" />
            <Input name="budget" placeholder="Budget (₹)" />
          </div>
          <Button type="submit" variant="brand" size="lg" disabled={busy}>{busy ? "Sending…" : "Send hiring request"}</Button>
        </form>
      )}
    </div>
  );
}
