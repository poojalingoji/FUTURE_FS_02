import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Users, Zap, Shield, Sparkles, CheckCircle2, Star } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: Landing });

const FEATURES = [
  { icon: Users, title: "Unified Lead Inbox", desc: "Capture leads from your website, social, and referrals in one organized pipeline." },
  { icon: BarChart3, title: "Real-time Analytics", desc: "Pipeline health, conversion trends, and source attribution at a glance." },
  { icon: Zap, title: "Smart Follow-ups", desc: "Auto-schedule reminders, log every touchpoint and never miss a beat." },
  { icon: Shield, title: "Secure & Private", desc: "Bank-grade encryption, role-based access, and full audit trails." },
  { icon: Sparkles, title: "Beautiful UX", desc: "An interface your team actually wants to open every morning." },
  { icon: CheckCircle2, title: "Built to scale", desc: "From your first 10 leads to your first 10,000 — no migration needed." },
];

const TESTIMONIALS = [
  { name: "Sarah Johnson", role: "Head of Growth, Bright Labs", quote: "We replaced three tools with LeadFlow. Our conversion rate jumped 34% in the first quarter.", initials: "SJ" },
  { name: "Michael Brown", role: "VP Sales, Northwind", quote: "The cleanest CRM I've ever used. It just gets out of the way and lets the team sell.", initials: "MB" },
  { name: "Priya Sharma", role: "Founder, Acme Apps", quote: "Set up in 10 minutes. Our SDRs were live and tracking leads the same afternoon.", initials: "PS" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-[0.08]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="container relative mx-auto max-w-7xl px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              The modern CRM for ambitious teams
            </div>
            <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
              Turn every lead into <span className="text-gradient">revenue.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              LeadFlow gives your team one beautiful place to capture, qualify and convert leads — without the bloat of legacy CRMs.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-gradient-primary shadow-elegant">
                <Link to="/signup">Start free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Talk to sales</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">No credit card required · 14-day free trial</p>
          </div>

          {/* Hero dashboard mock */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="absolute -inset-x-12 -inset-y-6 bg-gradient-primary opacity-20 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border bg-card shadow-elegant">
              <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-destructive/60" />
                <span className="h-3 w-3 rounded-full bg-warning/70" />
                <span className="h-3 w-3 rounded-full bg-success/70" />
                <span className="ml-3 text-xs text-muted-foreground">leadflow.app/dashboard</span>
              </div>
              <div className="grid grid-cols-4 gap-4 p-6">
                {[
                  { label: "Total Leads", value: "2,847", trend: "+12%" },
                  { label: "Qualified", value: "412", trend: "+8%" },
                  { label: "Converted", value: "187", trend: "+24%" },
                  { label: "Conv. Rate", value: "23.4%", trend: "+3.1%" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border bg-background p-4">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-2xl font-semibold">{s.value}</p>
                    <p className="mt-1 text-xs text-success">{s.trend} vs last month</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 px-6 pb-6">
                <div className="col-span-2 h-48 rounded-xl border bg-background p-4">
                  <p className="text-sm font-medium">Pipeline trend</p>
                  <svg viewBox="0 0 400 140" className="mt-2 h-32 w-full">
                    <defs>
                      <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.52 0.22 270)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="oklch(0.52 0.22 270)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,100 C50,80 90,60 140,55 C190,50 230,80 280,40 C330,15 370,25 400,15 L400,140 L0,140 Z" fill="url(#g1)" />
                    <path d="M0,100 C50,80 90,60 140,55 C190,50 230,80 280,40 C330,15 370,25 400,15" stroke="oklch(0.52 0.22 270)" strokeWidth="2.5" fill="none" />
                  </svg>
                </div>
                <div className="h-48 rounded-xl border bg-background p-4">
                  <p className="text-sm font-medium">By source</p>
                  <div className="mt-3 space-y-2.5">
                    {[["Website", 70], ["LinkedIn", 55], ["Referral", 40], ["Ads", 25]].map(([n, w]) => (
                      <div key={n as string}>
                        <div className="flex justify-between text-xs text-muted-foreground"><span>{n}</span><span>{w}%</span></div>
                        <div className="mt-1 h-1.5 rounded-full bg-muted">
                          <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${w}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto max-w-7xl px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight">Everything you need. <span className="text-gradient">Nothing you don't.</span></h2>
          <p className="mt-4 text-muted-foreground">A complete toolkit for lead capture, qualification and conversion.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-2xl border bg-card p-6 shadow-card transition-all hover:shadow-elegant hover:-translate-y-1">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-y bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight">Loved by teams worldwide</h2>
            <p className="mt-4 text-muted-foreground">Join thousands of sales teams growing faster with LeadFlow.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border bg-card p-6 shadow-card">
                <div className="flex gap-0.5 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mt-4 text-sm leading-relaxed">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">{t.initials}</div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-7xl px-4 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 text-center shadow-elegant md:p-16">
          <div className="pointer-events-none absolute -top-20 right-0 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl" />
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-5xl">Ready to close more deals?</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">Spin up your CRM in minutes. No setup calls, no contracts.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary">
              <Link to="/signup">Get started free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/contact">Submit a lead</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
