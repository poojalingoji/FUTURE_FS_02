import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, UserPlus, MessageCircle, Trophy, XCircle, TrendingUp, ArrowRight, CalendarClock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import type { Lead, LeadStatus } from "@/lib/leads";
import { STATUS_META } from "@/lib/leads";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AddLeadDialog } from "@/components/add-lead-dialog";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LeadFlow CRM" }] }),
  component: DashboardPage,
});

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "oklch(0.65 0.16 230)",
  contacted: "oklch(0.78 0.17 75)",
  
  converted: "oklch(0.68 0.17 155)",
  lost: "oklch(0.60 0.23 27)",
};

function DashboardPage() {
  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const total = leads?.length ?? 0;
  const by = (s: LeadStatus) => leads?.filter((l) => l.status === s).length ?? 0;
  const converted = by("converted");
  const conversionRate = total ? ((converted / total) * 100).toFixed(1) : "0";

  const statusData = (Object.keys(STATUS_META) as LeadStatus[]).map((s) => ({
    name: STATUS_META[s].label, value: by(s), color: STATUS_COLORS[s],
  }));

  // Monthly leads (last 6 months)
  const monthly: { month: string; leads: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleString("en", { month: "short" });
    const count = leads?.filter((l) => {
      const ld = new Date(l.created_at);
      return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
    }).length ?? 0;
    monthly.push({ month: key, leads: count });
  }

  const sourceMap = new Map<string, number>();
  leads?.forEach((l) => sourceMap.set(l.source, (sourceMap.get(l.source) ?? 0) + 1));
  const sourceData = Array.from(sourceMap.entries()).map(([name, value]) => ({ name, value }));

  const STATS = [
    { label: "Total Leads", value: total, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "New", value: by("new"), icon: UserPlus, color: "text-info", bg: "bg-info/10" },
    { label: "Contacted", value: by("contacted"), icon: MessageCircle, color: "text-warning-foreground", bg: "bg-warning/15" },
    { label: "Converted", value: converted, icon: Trophy, color: "text-success", bg: "bg-success/10" },
    { label: "Lost", value: by("lost"), icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Conv. Rate", value: `${conversionRate}%`, icon: TrendingUp, color: "text-primary", bg: "bg-gradient-primary text-primary-foreground" },
  ];

  const recent = leads?.slice(0, 5) ?? [];
  const today = new Date(); today.setHours(0,0,0,0);
  const in14 = new Date(today); in14.setDate(in14.getDate() + 14);
  const upcoming = (leads ?? [])
    .filter((l) => l.follow_up_date && new Date(l.follow_up_date) >= today && new Date(l.follow_up_date) <= in14)
    .sort((a,b) => new Date(a.follow_up_date!).getTime() - new Date(b.follow_up_date!).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Pipeline overview and lead performance.</p>
        </div>
        <AddLeadDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5 shadow-card transition hover:shadow-elegant">
            <div className={`grid h-9 w-9 place-items-center rounded-lg ${s.bg}`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-card lg:col-span-2">
          <h3 className="text-sm font-semibold">Monthly leads</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthly} margin={{ top: 20, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="month" className="text-xs" stroke="currentColor" />
              <YAxis className="text-xs" stroke="currentColor" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="leads" fill="var(--primary)" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold">By status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {statusData.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold">Lead sources</h3>
          <div className="mt-4 space-y-3">
            {sourceData.map((s) => {
              const pct = total ? Math.round((s.value / total) * 100) : 0;
              return (
                <div key={s.name}>
                  <div className="flex justify-between text-xs"><span>{s.name}</span><span className="text-muted-foreground">{s.value} · {pct}%</span></div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent leads</h3>
            <Link to="/leads" className="text-xs text-primary hover:underline inline-flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="mt-4 divide-y">
            {recent.map((l) => (
              <Link key={l.id} to="/leads/$id" params={{ id: l.id }} className="flex items-center justify-between py-3 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                    {l.full_name.split(" ").map((n) => n[0]).slice(0,2).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{l.full_name}</p>
                    <p className="text-xs text-muted-foreground">{l.company ?? l.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className={STATUS_META[l.status].className}>{STATUS_META[l.status].label}</Badge>
              </Link>
            ))}
            {!recent.length && <p className="py-6 text-center text-sm text-muted-foreground">No leads yet.</p>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Upcoming follow-ups (next 14 days)</h3>
        </div>
        <div className="mt-4 divide-y">
          {upcoming.map((l) => (
            <Link key={l.id} to="/leads/$id" params={{ id: l.id }} className="flex items-center justify-between py-3 -mx-2 px-2 rounded-lg hover:bg-muted/30 transition">
              <div>
                <p className="text-sm font-medium">{l.full_name}</p>
                <p className="text-xs text-muted-foreground">{l.company ?? l.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{new Date(l.follow_up_date!).toLocaleDateString()}</p>
                <Badge variant="outline" className={STATUS_META[l.status].className}>{STATUS_META[l.status].label}</Badge>
              </div>
            </Link>
          ))}
          {!upcoming.length && <p className="py-6 text-center text-sm text-muted-foreground">No follow-ups scheduled in the next 14 days.</p>}
        </div>
      </div>
    </div>
  );
}
