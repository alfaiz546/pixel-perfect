import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";

export function Logo({ size = 48 }: { size?: number }) {
  return <img src={logo.url} alt="KamConnect logo" width={size} height={size} style={{ width: size, height: size }} className="object-contain" />;
}

const NAV = [
  { to: "/", label: "Home" },
  { to: "/workers", label: "Find Workers" },
  { to: "/jobs", label: "Find Jobs" },
  { to: "/hire", label: "Hire Professionals" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/feedback", label: "Feedback" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  const navigate = useNavigate();
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-3">
          <Logo size={52} />
          <span className="leading-tight">
            <b className="block font-display text-lg text-primary">काम Connect</b>
            <small className="block text-[11px] text-muted-foreground">काम ढूँढें • काम दें • आगे बढ़ें</small>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground lg:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="hover:text-brand" activeProps={{ className: "text-brand" }} activeOptions={{ exact: n.to === "/" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Button asChild variant="outline"><Link to="/dashboard">Dashboard</Link></Button>
              <Button onClick={signOut}>Sign out</Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline"><Link to="/auth" search={{ mode: "login" }}>Log in</Link></Button>
              <Button asChild><Link to="/auth" search={{ mode: "signup" }}>Sign up</Link></Button>
            </>
          )}
        </div>
        <button className="rounded-md border border-border p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="flex flex-col gap-3 border-t border-border bg-background px-5 py-4 lg:hidden" onClick={() => setOpen(false)}>
          {NAV.map((n) => <Link key={n.to} to={n.to} className="font-semibold">{n.label}</Link>)}
          {user ? (
            <div className="flex gap-2"><Button asChild variant="outline"><Link to="/dashboard">Dashboard</Link></Button><Button onClick={signOut}>Sign out</Button></div>
          ) : (
            <div className="flex gap-2">
              <Button asChild variant="outline"><Link to="/auth" search={{ mode: "login" }}>Log in</Link></Button>
              <Button asChild><Link to="/auth" search={{ mode: "signup" }}>Sign up</Link></Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-background p-1"><Logo size={56} /></span>
            <div>
              <b className="font-display text-xl">काम Connect</b>
              <p className="text-sm opacity-80">Find Work • Hire Skilled Professionals</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm opacity-75">Connecting India's skilled workers with homes, businesses and project teams — with verified work history and fair ratings.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <b>Explore</b>
          <Link to="/workers" className="opacity-80 hover:opacity-100">Find Workers</Link>
          <Link to="/jobs" className="opacity-80 hover:opacity-100">Find Jobs</Link>
          <Link to="/hire" className="opacity-80 hover:opacity-100">Hire Professionals</Link>
          <Link to="/leaderboard" className="opacity-80 hover:opacity-100">Leaderboard</Link>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <b>Support</b>
          <Link to="/feedback" className="opacity-80 hover:opacity-100">Feedback</Link>
          <Link to="/" hash="faq" className="opacity-80 hover:opacity-100">FAQ</Link>
          <Link to="/" hash="contact" className="opacity-80 hover:opacity-100">Contact us</Link>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 py-5 text-center text-xs opacity-70">© {new Date().getFullYear()} KamConnect. All rights reserved.</div>
    </footer>
  );
}
