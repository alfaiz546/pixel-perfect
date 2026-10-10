import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback — KamConnect" },
      { name: "description", content: "Share suggestions, report bugs or tell us about your KamConnect experience." },
      { property: "og:title", content: "Feedback — KamConnect" },
      { property: "og:description", content: "Help us improve KamConnect." },
    ],
  }),
  component: FeedbackPage,
});

const schema = z.object({
  category: z.enum(["Suggestion", "Bug Report", "Experience", "Complaint", "Other"]),
  subject: z.string().trim().min(3, "Subject is too short").max(150),
  description: z.string().trim().min(10, "Please describe in a bit more detail").max(2000),
  email: z.string().trim().email("Enter a valid email").max(255).or(z.literal("")),
});

function FeedbackPage() {
  const { user } = useSession();
  const [rating, setRating] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
    setBusy(true);
    const ref = crypto.randomUUID().slice(0, 8).toUpperCase();
    const { error } = await supabase.from("feedback").insert({
      ...parsed.data, email: parsed.data.email || null, rating: rating || null, user_id: user?.id ?? null, ref,
    });
    setBusy(false);
    if (error) { toast.error("Could not send feedback. Please try again."); return; }
    setDone(ref);
  }

  if (done) return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-4xl font-extrabold text-primary">धन्यवाद! Thank you.</h1>
      <p className="mt-3 text-muted-foreground">Your feedback was received. Reference number:</p>
      <p className="mt-2 font-display text-3xl font-extrabold text-brand">KC-{done}</p>
      <Button className="mt-8" variant="outline" onClick={() => { setDone(null); setRating(0); }}>Send more feedback</Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-4xl font-extrabold text-primary">Feedback</h1>
      <p className="text-muted-foreground">Your ideas and reports help us make KamConnect better.</p>
      <form onSubmit={submit} className="mt-8 flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <select name="category" className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          {["Suggestion", "Bug Report", "Experience", "Complaint", "Other"].map((c) => <option key={c}>{c}</option>)}
        </select>
        <Input name="subject" placeholder="Subject" required maxLength={150} />
        <Textarea name="description" placeholder="Tell us more…" rows={5} required maxLength={2000} />
        <div>
          <span className="text-sm font-semibold">Rate your website experience (optional)</span>
          <div className="mt-1 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                <Star className={`size-7 ${n <= rating ? "fill-lime text-brand" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
        </div>
        <Input name="email" type="email" placeholder="Contact email (optional)" defaultValue={user?.email ?? ""} />
        <p className="text-xs text-muted-foreground">We use feedback only to improve the service. We never share your details.</p>
        <Button type="submit" variant="brand" size="lg" disabled={busy}>{busy ? "Sending…" : "Submit feedback"}</Button>
      </form>
    </div>
  );
}
