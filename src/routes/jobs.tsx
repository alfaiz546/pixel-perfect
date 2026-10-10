import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { MapPin, Clock, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { jobsQuery, PROFESSIONS } from "@/lib/data";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Find Jobs — KamConnect" },
      { name: "description", content: "Browse open jobs for electricians, painters, carpenters and other skilled trades across India." },
      { property: "og:title", content: "Find Jobs — KamConnect" },
      { property: "og:description", content: "Open work opportunities for skilled professionals." },
    ],
  }),
  component: JobsPage,
});

const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
const schema = z.object({
  title: z.string().trim().min(3).max(120), skill: z.string().min(1), city: z.string().trim().min(2).max(60),
  area: z.string().trim().max(60), budget: z.string().trim().max(40), timing: z.string().trim().max(40),
  hire_type: z.enum(["Individual", "Team"]), description: z.string().trim().max(1000),
});

function JobsPage() {
  const { data = [] } = useQuery(jobsQuery);
  const { user } = useSession();
  const qc = useQueryClient();
  const [skill, setSkill] = useState("");
  const [busy, setBusy] = useState(false);
  const list = data.filter((j) => !skill || j.skill === skill);

  async function post(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const form = e.currentTarget;
    const parsed = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
    setBusy(true);
    const { error } = await supabase.from("jobs").insert({ ...parsed.data, posted_by: user.id });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Job posted!");
    form.reset();
    qc.invalidateQueries({ queryKey: ["jobs"] });
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="text-4xl font-extrabold text-primary">Find jobs</h1>
        <p className="text-muted-foreground">काम ढूँढें — open opportunities near you</p>
        <select className={`${sel} mt-6 max-w-xs`} value={skill} onChange={(e) => setSkill(e.target.value)}>
          <option value="">All trades</option>{PROFESSIONS.map((p) => <option key={p}>{p}</option>)}
        </select>
        <div className="mt-6 flex flex-col gap-4">
          {list.map((j) => (
            <div key={j.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-primary">{j.title}</h3>
                <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">{j.hire_type}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="font-semibold text-brand">{j.skill}</span>
                <span className="flex items-center gap-1"><MapPin className="size-4" />{j.area ? `${j.area}, ` : ""}{j.city}</span>
                {j.budget && <span className="flex items-center gap-1"><IndianRupee className="size-4" />{j.budget}</span>}
                {j.timing && <span className="flex items-center gap-1"><Clock className="size-4" />{j.timing}</span>}
              </div>
              {j.description && <p className="mt-2 text-sm">{j.description}</p>}
              {j.is_sample && <span className="mt-2 block text-[10px] uppercase tracking-wider text-muted-foreground">Sample listing</span>}
            </div>
          ))}
          {list.length === 0 && <p className="text-muted-foreground">No jobs in this trade right now.</p>}
        </div>
      </div>
      <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-2xl font-bold text-primary">Post a job</h2>
        {!user ? (
          <div className="mt-3 text-sm text-muted-foreground">
            <p>Sign in to post a job opportunity.</p>
            <Button asChild className="mt-4"><Link to="/auth" search={{ mode: "login" }}>Sign in to post</Link></Button>
          </div>
        ) : (
          <form onSubmit={post} className="mt-4 flex flex-col gap-3">
            <Input name="title" placeholder="Job title" required />
            <select name="skill" className={sel} required defaultValue=""><option value="" disabled>Trade</option>{PROFESSIONS.map((p) => <option key={p}>{p}</option>)}</select>
            <div className="grid grid-cols-2 gap-2"><Input name="city" placeholder="City" required /><Input name="area" placeholder="Area" /></div>
            <div className="grid grid-cols-2 gap-2"><Input name="budget" placeholder="Budget (₹)" /><Input name="timing" placeholder="When" /></div>
            <select name="hire_type" className={sel}><option>Individual</option><option>Team</option></select>
            <Textarea name="description" placeholder="Describe the work" />
            <Button type="submit" variant="brand" disabled={busy}>{busy ? "Posting…" : "Post job"}</Button>
          </form>
        )}
      </aside>
    </div>
  );
}
