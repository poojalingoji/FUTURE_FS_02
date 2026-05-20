import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Mail, Phone, Building2, Calendar, Trash2, Save, Activity, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Lead, LeadStatus, LeadPriority } from "@/lib/leads";
import { STATUS_META, PRIORITY_META, LEAD_SOURCES } from "@/lib/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/leads_/$id")({
  head: () => ({ meta: [{ title: "Lead detail — LeadFlow CRM" }] }),
  component: LeadDetailPage,
});

interface Note { id: string; note_text: string; created_at: string; }
interface Activity { id: string; activity_type: string; activity_description: string; created_at: string; }

function LeadDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [noteText, setNoteText] = useState("");

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Lead;
    },
  });

  const { data: notes } = useQuery({
    queryKey: ["notes", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("notes").select("*").eq("lead_id", id).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Note[];
    },
  });

  const { data: activity } = useQuery({
    queryKey: ["activity", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("activity_logs").select("*").eq("lead_id", id).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Activity[];
    },
  });

  const [draft, setDraft] = useState<Partial<Lead>>({});
  const merged = { ...(lead ?? {}), ...draft } as Lead;

  const saveLead = async () => {
    if (!Object.keys(draft).length) return toast.info("No changes to save");
    const { error } = await supabase.from("leads").update(draft).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Lead updated");
    setDraft({});
    qc.invalidateQueries({ queryKey: ["lead", id] });
    qc.invalidateQueries({ queryKey: ["leads"] });
    qc.invalidateQueries({ queryKey: ["activity", id] });
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    const { error } = await supabase.from("notes").insert({ lead_id: id, note_text: noteText.trim() });
    if (error) return toast.error(error.message);
    await supabase.from("activity_logs").insert({ lead_id: id, activity_type: "note", activity_description: "Note added" });
    setNoteText("");
    toast.success("Note added");
    qc.invalidateQueries({ queryKey: ["notes", id] });
    qc.invalidateQueries({ queryKey: ["activity", id] });
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm("Delete this note?")) return;
    const { error } = await supabase.from("notes").delete().eq("id", noteId);
    if (error) return toast.error(error.message);
    toast.success("Note deleted");
    qc.invalidateQueries({ queryKey: ["notes", id] });
  };

  const deleteLead = async () => {
    if (!confirm("Delete this lead permanently?")) return;
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Lead deleted");
    navigate({ to: "/leads" });
  };

  if (isLoading || !lead) {
    return <div className="space-y-4"><Skeleton className="h-12 w-64" /><Skeleton className="h-96" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/leads" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to leads
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={deleteLead}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
          <Button onClick={saveLead} className="bg-gradient-primary"><Save className="mr-2 h-4 w-4" /> Save changes</Button>
        </div>
      </div>

      {/* Profile header */}
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-start gap-5">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary text-xl font-semibold text-primary-foreground shadow-elegant">
            {lead.full_name.split(" ").map((n) => n[0]).slice(0,2).join("")}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{lead.full_name}</h2>
            <p className="text-sm text-muted-foreground">{lead.company ?? "—"}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Mail className="h-4 w-4" /> {lead.email}</span>
              {lead.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4" /> {lead.phone}</span>}
              {lead.company && <span className="inline-flex items-center gap-1.5"><Building2 className="h-4 w-4" /> {lead.company}</span>}
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Added {new Date(lead.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className={STATUS_META[lead.status].className}>{STATUS_META[lead.status].label}</Badge>
            <Badge className={PRIORITY_META[lead.priority].className}>{PRIORITY_META[lead.priority].label} priority</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Edit fields */}
        <div className="rounded-2xl border bg-card p-6 shadow-card lg:col-span-2">
          <h3 className="text-sm font-semibold">Lead details</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Full name"><Input value={merged.full_name} onChange={(e) => setDraft({...draft, full_name: e.target.value})} /></Field>
            <Field label="Email"><Input value={merged.email} onChange={(e) => setDraft({...draft, email: e.target.value})} /></Field>
            <Field label="Phone"><Input value={merged.phone ?? ""} onChange={(e) => setDraft({...draft, phone: e.target.value})} /></Field>
            <Field label="Company"><Input value={merged.company ?? ""} onChange={(e) => setDraft({...draft, company: e.target.value})} /></Field>
            <Field label="Source">
              <Select value={merged.source} onValueChange={(v) => setDraft({...draft, source: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LEAD_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={merged.status} onValueChange={(v) => setDraft({...draft, status: v as LeadStatus})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(Object.keys(STATUS_META) as LeadStatus[]).map((s) => <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={merged.priority} onValueChange={(v) => setDraft({...draft, priority: v as LeadPriority})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(Object.keys(PRIORITY_META) as LeadPriority[]).map((p) => <SelectItem key={p} value={p}>{PRIORITY_META[p].label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Follow-up date">
              <Input type="date" value={merged.follow_up_date ?? ""} onChange={(e) => setDraft({...draft, follow_up_date: e.target.value || null})} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Initial message">
              <Textarea rows={3} value={merged.message ?? ""} onChange={(e) => setDraft({...draft, message: e.target.value})} />
            </Field>
          </div>
        </div>

        {/* Notes + Activity */}
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <Tabs defaultValue="notes">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="notes" className="mt-4 space-y-3">
              <Textarea rows={3} placeholder="Add a note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} />
              <Button size="sm" onClick={addNote} className="w-full bg-gradient-primary">Add note</Button>
              <div className="max-h-72 space-y-3 overflow-auto pt-2">
                {notes?.map((n) => (
                  <div key={n.id} className="group relative rounded-lg border bg-muted/30 p-3">
                    <button onClick={() => deleteNote(n.id)} className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <p className="text-sm pr-5">{n.note_text}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                ))}
                {!notes?.length && <p className="text-center text-xs text-muted-foreground">No notes yet.</p>}
              </div>
            </TabsContent>
            <TabsContent value="activity" className="mt-4">
              <div className="max-h-96 space-y-3 overflow-auto">
                {activity?.map((a) => (
                  <div key={a.id} className="flex gap-3">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Activity className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 border-l-2 border-border pl-3">
                      <p className="text-sm">{a.activity_description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {!activity?.length && <p className="text-center text-xs text-muted-foreground">No activity yet.</p>}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
