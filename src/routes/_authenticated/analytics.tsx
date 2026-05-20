import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, BarChart, Bar, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import type { Lead } from "@/lib/leads";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — LeadFlow CRM" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data as Lead[];
    },
  });

  if (isLoading) return <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-72" /><Skeleton className="h-72" /><Skeleton className="h-72" /><Skeleton className="h-72" /></div>;

  // Cumulative growth
  const sorted = [...(leads ?? [])].sort((a,b) => +new Date(a.created_at) - +new Date(b.created_at));
  const monthMap = new Map<string, { month: string; total: number; converted: number }>();
  sorted.forEach((l) => {
    const d = new Date(l.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const e = monthMap.get(key) ?? { month: d.toLocaleString("en", { month: "short" }), total: 0, converted: 0 };
    e.total += 1;
    if (l.status === "converted") e.converted += 1;
    monthMap.set(key, e);
  });
  const growth = Array.from(monthMap.values());
  let cum = 0;
  const growthCum = growth.map((g) => { cum += g.total; return { month: g.month, leads: cum }; });

  // Source perf
  const sources = new Map<string, { name: string; total: number; converted: number }>();
  leads?.forEach((l) => {
    const s = sources.get(l.source) ?? { name: l.source, total: 0, converted: 0 };
    s.total++; if (l.status === "converted") s.converted++;
    sources.set(l.source, s);
  });
  const sourceData = Array.from(sources.values());

  const total = leads?.length ?? 0;
  const converted = leads?.filter((l) => l.status === "converted").length ?? 0;
  const contacted = leads?.filter((l) => ["contacted","converted"].includes(l.status)).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-sm text-muted-foreground">Deep dive into your pipeline performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total leads", value: total },
          { label: "Contacted", value: contacted },
          { label: "Conversion rate", value: total ? `${((converted/total)*100).toFixed(1)}%` : "0%" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-6 shadow-card">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Total leads growth">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={growthCum}>
              <defs>
                <linearGradient id="ag" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" stroke="currentColor" />
              <YAxis className="text-xs" stroke="currentColor" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="leads" stroke="var(--primary)" strokeWidth={2} fill="url(#ag)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Contacted vs converted">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" stroke="currentColor" />
              <YAxis className="text-xs" stroke="currentColor" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="total" stroke="var(--info)" strokeWidth={2} name="New" />
              <Line type="monotone" dataKey="converted" stroke="var(--success)" strokeWidth={2} name="Converted" />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Source performance" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sourceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" stroke="currentColor" />
              <YAxis className="text-xs" stroke="currentColor" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="total" fill="var(--primary)" radius={[8,8,0,0]} name="Total" />
              <Bar dataKey="converted" fill="var(--success)" radius={[8,8,0,0]} name="Converted" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border bg-card p-6 shadow-card ${className}`}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}
