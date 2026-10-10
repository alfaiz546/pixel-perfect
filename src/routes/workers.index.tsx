import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { WorkerCard } from "@/components/worker-card";
import { PROFESSIONS, workersQuery } from "@/lib/data";

export const Route = createFileRoute("/workers/")({
  validateSearch: z.object({ skill: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Find Skilled Workers — KamConnect" },
      { name: "description", content: "Search electricians, plumbers, carpenters, painters and more by city, rating and experience." },
      { property: "og:title", content: "Find Skilled Workers — KamConnect" },
      { property: "og:description", content: "Search trusted skilled workers by skill, city and rating." },
    ],
  }),
  component: WorkersPage,
});

const sel = "h-10 rounded-md border border-input bg-background px-3 text-sm";

function WorkersPage() {
  const search = Route.useSearch();
  const { data = [], isLoading } = useQuery(workersQuery);
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState(search.skill ?? "");
  const [city, setCity] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [minExp, setMinExp] = useState(0);
  const [team, setTeam] = useState(false);
  const cities = [...new Set(data.map((w) => w.city))].sort();
  const list = useMemo(() => data.filter((w) => {
    const text = `${w.name} ${w.skill} ${w.tags.join(" ")} ${w.area}`.toLowerCase();
    return (!q || text.includes(q.toLowerCase())) && (!skill || w.skill === skill) && (!city || w.city === city)
      && Number(w.rating) >= minRating && w.experience_years >= minExp && (!team || w.team_available);
  }), [data, q, skill, city, minRating, minExp, team]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <h1 className="text-4xl font-extrabold text-primary">Find skilled workers</h1>
      <p className="text-muted-foreground">कारीगर खोजें — filter by trade, city, rating and more</p>
      <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-6">
        <Input className="md:col-span-2" placeholder="Search name or service…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={sel} value={skill} onChange={(e) => setSkill(e.target.value)}>
          <option value="">All skills</option>{PROFESSIONS.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className={sel} value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All cities</option>{cities.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={sel} value={minRating} onChange={(e) => setMinRating(+e.target.value)}>
          <option value={0}>Any rating</option><option value={4}>4.0+</option><option value={4.5}>4.5+</option>
        </select>
        <select className={sel} value={minExp} onChange={(e) => setMinExp(+e.target.value)}>
          <option value={0}>Any experience</option><option value={3}>3+ yrs</option><option value={5}>5+ yrs</option><option value={8}>8+ yrs</option>
        </select>
        <label className="flex items-center gap-2 text-sm md:col-span-6"><input type="checkbox" checked={team} onChange={(e) => setTeam(e.target.checked)} /> Available for team projects</label>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">{isLoading ? "Loading…" : `${list.length} worker${list.length === 1 ? "" : "s"} found`}</p>
      <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{list.map((w) => <WorkerCard key={w.id} w={w} />)}</div>
      {!isLoading && list.length === 0 && <p className="mt-10 text-center text-muted-foreground">No workers match these filters yet.</p>}
    </div>
  );
}
