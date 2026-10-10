import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { initials, type Worker } from "@/lib/data";

export function WorkerAvatar({ w, size = 56 }: { w: Pick<Worker, "name" | "avatar_url">; size?: number }) {
  return w.avatar_url ? (
    <img src={w.avatar_url} alt={w.name} style={{ width: size, height: size }} className="rounded-2xl object-cover" />
  ) : (
    <div style={{ width: size, height: size }} className="grid place-items-center rounded-2xl bg-brand-soft font-display font-bold text-brand">
      {initials(w.name)}
    </div>
  );
}

export function WorkerCard({ w }: { w: Worker }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <WorkerAvatar w={w} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 font-display font-bold text-primary">
            {w.name} {w.verified_jobs > 0 && <BadgeCheck className="size-4 text-brand" />}
          </div>
          <div className="text-sm font-semibold text-brand">{w.skill}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{w.area ? `${w.area}, ` : ""}{w.city}</div>
        </div>
        <div className="flex items-center gap-1 text-sm font-bold"><Star className="size-4 fill-lime text-brand" />{Number(w.rating).toFixed(1)}</div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {w.tags.map((t) => <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{t}</span>)}
      </div>
      <div className="mt-auto flex items-center justify-between pt-5 text-sm">
        <span className="text-muted-foreground">{w.experience_years} yrs • {w.rate ?? "Rate on request"}</span>
        <Link to="/workers/$id" params={{ id: w.id }} className="font-bold text-brand hover:underline">View profile →</Link>
      </div>
      {w.is_sample && <span className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">Sample profile</span>}
    </div>
  );
}
