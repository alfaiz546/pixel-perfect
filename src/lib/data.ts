import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PROFESSIONS = [
  "Electrician", "Carpenter", "Plumber", "Painter", "Tailor",
  "Mason", "Cleaner", "Mechanic", "Construction", "Technician",
] as const;

export const workersQuery = queryOptions({
  queryKey: ["workers"],
  queryFn: async () => {
    const { data, error } = await supabase.from("workers").select("*").order("rating", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const jobsQuery = queryOptions({
  queryKey: ["jobs"],
  queryFn: async () => {
    const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export type Worker = Awaited<ReturnType<typeof workersQuery.queryFn & {}>>[number];

/** Trust score (0-100): rating 35%, repeat 25%, on-time 20%, volume 10%, consistency 10%.
 *  Repeat/on-time data isn't collected yet, so those parts use neutral 50%. */
export function trustScore(w: { rating: number; verified_jobs: number; experience_years: number }) {
  const rating = (Number(w.rating) / 5) * 35;
  const repeat = 0.5 * 25;
  const onTime = 0.5 * 20;
  const volume = Math.min(w.verified_jobs / 50, 1) * 10;
  const consistency = Math.min(w.experience_years / 10, 1) * 10;
  return Math.round(rating + repeat + onTime + volume + consistency);
}

export function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}
