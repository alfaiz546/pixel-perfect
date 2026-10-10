import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, MapPin, Star, Languages, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkerAvatar } from "@/components/worker-card";
import { supabase } from "@/integrations/supabase/client";
import { trustScore } from "@/lib/data";

export const Route = createFileRoute("/workers/$id")({
  head: () => ({
    meta: [
      { title: "Skill Passport — KamConnect" },
      { name: "description", content: "Verified skill passport: experience, ratings and work history of a KamConnect professional." },
      { property: "og:title", content: "Skill Passport — KamConnect" },
      { property: "og:description", content: "View this professional's verified skills, ratings and trust score." },
    ],
  }),
  component: WorkerPage,
});

function WorkerPage() {
  const { id } = Route.useParams();
  const { data: w, isLoading } = useQuery({
    queryKey: ["worker", id],
    queryFn: async () => (await supabase.from("workers").select("*").eq("id", id).maybeSingle()).data,
  });
  if (isLoading) return <p className="p-20 text-center">Loading…</p>;
  if (!w) return <p className="p-20 text-center">Worker not found. <Link to="/workers" className="text-brand">Back to search</Link></p>;
  const score = trustScore(w);
  const url = typeof window !== "undefined" ? window.location.href : "";
  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
        <div className="flex flex-wrap items-start gap-6">
          <WorkerAvatar w={w} size={110} />
          <div className="flex-1">
            <span className="text-xs font-extrabold tracking-widest text-brand">DIGITAL SKILL PASSPORT</span>
            <h1 className="flex items-center gap-2 text-4xl font-extrabold text-primary">{w.name}{w.verified_jobs > 0 && <BadgeCheck className="size-7 text-brand" />}</h1>
            <p className="text-lg font-semibold text-brand">{w.skill}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="size-4" />{w.area ? `${w.area}, ` : ""}{w.city}</span>
              <span className="flex items-center gap-1"><Briefcase className="size-4" />{w.experience_years} years</span>
              {w.languages.length > 0 && <span className="flex items-center gap-1"><Languages className="size-4" />{w.languages.join(", ")}</span>}
            </div>
          </div>
          {url && <img alt="QR code for this profile" className="rounded-xl border border-border" width={110} height={110}
            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`} />}
        </div>
        <p className="mt-6 text-muted-foreground">{w.about}</p>
        <div className="mt-4 flex flex-wrap gap-2">{w.tags.map((t) => <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs">{t}</span>)}</div>
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <Stat label="Rating" value={<span className="flex items-center gap-1"><Star className="size-5 fill-lime text-brand" />{Number(w.rating).toFixed(1)}</span>} />
          <Stat label="Reviews" value={w.reviews_count} />
          <Stat label="Verified jobs" value={w.verified_jobs} />
          <Stat label="Trust score" value={`${score}/100`} />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="brand" size="lg"><Link to="/hire" search={{ tab: "individual", worker: w.id }}>Hire {w.name.split(" ")[0]}</Link></Button>
          <Button variant="outline" size="lg" onClick={() => navigator.clipboard?.writeText(url)}>Copy profile link</Button>
        </div>
        {w.is_sample && <p className="mt-4 text-xs text-muted-foreground">This is a sample profile for demonstration.</p>}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-2xl bg-muted p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="font-display text-2xl font-extrabold text-primary">{value}</div></div>;
}
