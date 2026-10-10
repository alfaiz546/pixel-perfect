import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Star, Trophy } from "lucide-react";
import { WorkerAvatar } from "@/components/worker-card";
import { PROFESSIONS, trustScore, workersQuery } from "@/lib/data";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Worker Leaderboard — KamConnect" },
      { name: "description", content: "Top skilled workers ranked by trust score, ratings and verified jobs." },
      { property: "og:title", content: "Worker Leaderboard — KamConnect" },
      { property: "og:description", content: "See the most trusted skilled professionals on KamConnect." },
    ],
  }),
  component: Leaderboard,
});

const sel = "h-10 rounded-md border border-input bg-background px-3 text-sm";

function Leaderboard() {
  const { data = [] } = useQuery(workersQuery);
  const [skill, setSkill] = useState("");
  const [city, setCity] = useState("");
  const cities = [...new Set(data.map((w) => w.city))].sort();
  const ranked = data
    .filter((w) => (!skill || w.skill === skill) && (!city || w.city === city))
    .map((w) => ({ w, score: trustScore(w) }))
    .sort((a, b) => b.score - a.score);
  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="flex items-center gap-3 text-4xl font-extrabold text-primary"><Trophy className="size-9 text-brand" /> Worker leaderboard</h1>
      <p className="text-muted-foreground">Ranked by trust score — ratings, verified jobs and consistency</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <select className={sel} value={skill} onChange={(e) => setSkill(e.target.value)}><option value="">All professions</option>{PROFESSIONS.map((p) => <option key={p}>{p}</option>)}</select>
        <select className={sel} value={city} onChange={(e) => setCity(e.target.value)}><option value="">All cities</option>{cities.map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        {ranked.map(({ w, score }, i) => (
          <div key={w.id} className="flex items-center gap-4 border-b border-border p-4 last:border-0">
            <span className={`grid size-10 place-items-center rounded-full font-display font-extrabold ${i < 3 ? "bg-lime text-primary" : "bg-muted"}`}>{i + 1}</span>
            <WorkerAvatar w={w} size={48} />
            <div className="flex-1">
              <b className="text-primary">{w.name}</b>
              <div className="text-sm text-muted-foreground">{w.skill} • {w.city}</div>
            </div>
            <div className="hidden text-sm sm:block"><span className="flex items-center gap-1"><Star className="size-4 fill-lime text-brand" />{Number(w.rating).toFixed(1)}</span></div>
            <div className="hidden text-sm text-muted-foreground sm:block">{w.verified_jobs} jobs</div>
            <div className="font-display text-xl font-extrabold text-brand">{score}</div>
            <Link to="/workers/$id" params={{ id: w.id }} className="text-sm font-bold text-primary hover:text-brand">View</Link>
          </div>
        ))}
        {ranked.length === 0 && <p className="p-8 text-center text-muted-foreground">No workers yet for this filter.</p>}
      </div>
    </div>
  );
}
