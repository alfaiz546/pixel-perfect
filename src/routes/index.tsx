import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, ShieldCheck, Users, Search, Hammer, Paintbrush, Wrench, Zap, Scissors, Brick, Sparkles, Car, HardHat, Cpu, Mail, Phone } from "lucide-react";
import hero from "@/assets/hero.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { WorkerCard } from "@/components/worker-card";
import { workersQuery } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KamConnect — काम ढूँढें • काम दें • आगे बढ़ें" },
      { name: "description", content: "Find trusted electricians, plumbers, painters and more — or find your next job. Verified work history for India's skilled workforce." },
      { property: "og:title", content: "KamConnect — Find Work. Hire Skilled Professionals." },
      { property: "og:description", content: "Find trusted skilled workers or your next job, with verified work history and fair ratings." },
    ],
  }),
  component: Home,
});

const PROFS = [
  { name: "Electrician", icon: Zap }, { name: "Carpenter", icon: Hammer }, { name: "Plumber", icon: Wrench },
  { name: "Painter", icon: Paintbrush }, { name: "Tailor", icon: Scissors }, { name: "Mason", icon: Brick },
  { name: "Cleaner", icon: Sparkles }, { name: "Mechanic", icon: Car }, { name: "Construction", icon: HardHat }, { name: "Technician", icon: Cpu },
];

function Home() {
  const { data: workers } = useQuery(workersQuery);
  return (
    <>
      <section className="bg-hero overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-rise">
            <div className="mb-4 flex items-center gap-2 text-xs font-extrabold tracking-[0.15em] text-brand">
              <span className="size-2 animate-pulse rounded-full bg-brand" /> BUILT FOR INDIA'S SKILLED WORKFORCE
            </div>
            <h1 className="text-5xl font-extrabold leading-[1.05] text-primary md:text-6xl">
              Your skills.<br />Your identity.<br /><span className="text-brand">Your next opportunity.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">Connect with trusted skilled professionals, discover meaningful work, and build a verified record of every job you complete.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="brand" size="lg"><Link to="/workers">Find skilled workers ↗</Link></Button>
              <Button asChild variant="outline" size="lg"><Link to="/jobs">Find work →</Link></Button>
            </div>
            <Link to="/auth" search={{ mode: "signup" }} className="mt-5 inline-block font-bold text-primary hover:text-brand">Create your skill profile →</Link>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>✓ Verified work history</span><span>✓ Individual & team hiring</span><span>✓ Privacy-first profiles</span>
            </div>
          </div>
          <div className="relative animate-rise [animation-delay:150ms]">
            <img src={hero.url} alt="KamConnect skilled professionals on a construction site" className="w-full rounded-3xl object-cover shadow-soft" />
            <div className="animate-floaty absolute -bottom-5 left-5 flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft">
              <BadgeCheck className="size-8 text-brand" />
              <div><b className="block text-sm">Work verified</b><small className="text-muted-foreground">Client-confirmed records</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <h2 className="text-center text-4xl font-extrabold text-primary">Browse professions</h2>
        <p className="mt-2 text-center text-muted-foreground">पेशे चुनें — pick a trade to see available workers</p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {PROFS.map(({ name, icon: Icon }, i) => (
            <Link key={name} to="/workers" search={{ skill: name }} style={{ animationDelay: `${i * 60}ms` }}
              className="animate-rise group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-brand hover:shadow-soft">
              <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand transition group-hover:scale-110"><Icon className="size-7" /></span>
              <b className="text-sm">{name}</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-muted py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><h2 className="text-4xl font-extrabold text-primary">Top-rated workers</h2><p className="text-muted-foreground">Trusted professionals near you</p></div>
            <Button asChild variant="outline"><Link to="/workers">See all workers →</Link></Button>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {workers?.slice(0, 3).map((w) => <WorkerCard key={w.id} w={w} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <h2 className="text-center text-4xl font-extrabold text-primary">Hire your way</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border p-8 shadow-soft">
            <Search className="size-9 text-brand" />
            <h3 className="mt-4 text-2xl font-bold">Individual hiring</h3>
            <p className="mt-2 text-muted-foreground">Need one electrician or tailor? Describe the task, pick a worker and send a request.</p>
            <Button asChild className="mt-6"><Link to="/hire" search={{ tab: "individual" }}>Hire a professional</Link></Button>
          </div>
          <div className="rounded-3xl bg-primary p-8 text-primary-foreground shadow-soft">
            <Users className="size-9 text-lime" />
            <h3 className="mt-4 text-2xl font-bold">Group / team hiring</h3>
            <p className="mt-2 opacity-80">Renovation or construction? Request a full team — masons, painters, plumbers — in one go.</p>
            <Button asChild variant="brand" className="mt-6"><Link to="/hire" search={{ tab: "team" }}>Build a team</Link></Button>
          </div>
        </div>
      </section>

      <section id="how" className="bg-hero py-20">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="text-center text-4xl font-extrabold text-primary">How it works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              ["1", "Create a profile", "Sign up as a worker or hirer and verify your email."],
              ["2", "Search & connect", "Filter by skill, city, rating and availability."],
              ["3", "Get the job done", "Send a hiring request and track its status."],
              ["4", "Build your record", "Completed jobs and reviews grow your trust score."],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-2xl bg-card p-6 shadow-soft">
                <span className="grid size-10 place-items-center rounded-full bg-brand font-bold text-accent-foreground">{n}</span>
                <h3 className="mt-4 text-lg font-bold">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-2">
        <div>
          <ShieldCheck className="size-10 text-brand" />
          <h2 className="mt-4 text-4xl font-extrabold text-primary">Safety & privacy first</h2>
          <p className="mt-3 text-muted-foreground">We never show home addresses publicly — only your approved service area. Phone numbers stay private until you choose to share. Reviews only come from clients linked to real jobs.</p>
        </div>
        <div id="faq">
          <h3 className="text-2xl font-bold text-primary">Frequently asked questions</h3>
          <Accordion type="single" collapsible className="mt-4">
            {[
              ["Is KamConnect free for workers?", "Yes. Creating a profile and applying to jobs is free."],
              ["How are workers verified?", "Jobs are marked verified only when the client confirms completion. Ratings come from those verified jobs."],
              ["Can I hire a whole team?", "Yes — use Team hiring to request several professions and headcounts for one project."],
              ["How is the trust score calculated?", "Average rating (35%), repeat customers (25%), on-time completion (20%), verified job volume (10%) and account consistency (10%)."],
            ].map(([q, a]) => (
              <AccordionItem key={q} value={q}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent>{a}</AccordionContent></AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-5">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-primary p-10 text-primary-foreground md:flex-row">
          <div>
            <h2 className="text-3xl font-extrabold">Questions? Talk to us.</h2>
            <p className="opacity-80">We usually reply within one working day.</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <span className="flex items-center gap-2"><Mail className="size-4" /> support@kamconnect.in</span>
            <span className="flex items-center gap-2"><Phone className="size-4" /> +91 00000 00000</span>
            <Button asChild variant="brand"><Link to="/feedback">Send feedback</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}
