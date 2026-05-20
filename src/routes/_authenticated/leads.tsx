import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Download, Eye, Trash2, Filter as FilterIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Lead, LeadStatus, LeadPriority } from "@/lib/leads";
import { STATUS_META, PRIORITY_META, LEAD_SOURCES, exportLeadsToCsv } from "@/lib/leads";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddLeadDialog } from "@/components/add-lead-dialog";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({ meta: [{ title: "Leads — LeadFlow CRM" }] }),
  component: LeadsPage,
});

const PAGE_SIZE = 10;

function LeadsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [source, setSource] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  const filtered = useMemo(() => {
    let list = leads ?? [];
    if (q) {
      const s = q.toLowerCase();
      list = list.filter((l) =>
        l.full_name.toLowerCase().includes(s) ||
        l.email.toLowerCase().includes(s) ||
        (l.company ?? "").toLowerCase().includes(s)
      );
    }
    if (status !== "all") list = list.filter((l) => l.status === status);
    if (source !== "all") list = list.filter((l) => l.source === source);
    if (priority !== "all") list = list.filter((l) => l.priority === priority);
    return list;
  }, [leads, q, status, source, priority]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead permanently?")) return;
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Lead deleted");
    qc.invalidateQueries({ queryKey: ["leads"] });
  };

  const updateStatus = async (id: string, newStatus: LeadStatus) => {
    const { error } = await supabase.from("leads").update({ status: newStatus }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    qc.invalidateQueries({ queryKey: ["leads"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} of {leads?.length ?? 0} leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportLeadsToCsv(filtered)} disabled={!filtered.length}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <AddLeadDialog />
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border bg-card p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, email or company..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              {(Object.keys(STATUS_META) as LeadStatus[]).map((s) => <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={source} onValueChange={(v) => { setSource(v); setPage(1); }}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {LEAD_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={(v) => { setPriority(v); setPage(1); }}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priority</SelectItem>
              {(Object.keys(PRIORITY_META) as LeadPriority[]).map((p) => <SelectItem key={p} value={p}>{PRIORITY_META[p].label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Lead</th>
                <th className="px-4 py-3 text-left font-medium">Company</th>
                <th className="px-4 py-3 text-left font-medium">Source</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Priority</th>
                <th className="px-4 py-3 text-left font-medium">Follow-up</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={8} className="p-3"><Skeleton className="h-10" /></td></tr>
              ))}
              {!isLoading && pageData.map((l) => (
                <tr key={l.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                        {l.full_name.split(" ").map((n) => n[0]).slice(0,2).join("")}
                      </div>
                      <div>
                        <p className="font-medium">{l.full_name}</p>
                        <p className="text-xs text-muted-foreground">{l.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.company ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.source}</td>
                  <td className="px-4 py-3">
                    <Select value={l.status} onValueChange={(v) => updateStatus(l.id, v as LeadStatus)}>
                      <SelectTrigger className="h-8 w-32">
                        <Badge variant="outline" className={STATUS_META[l.status].className}>{STATUS_META[l.status].label}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STATUS_META) as LeadStatus[]).map((s) => <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3"><Badge className={PRIORITY_META[l.priority].className}>{PRIORITY_META[l.priority].label}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{l.follow_up_date ? new Date(l.follow_up_date).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button asChild size="icon" variant="ghost"><Link to="/leads/$id" params={{ id: l.id }}><Eye className="h-4 w-4" /></Link></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !pageData.length && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">No leads match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <p className="text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
