import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LEAD_SOURCES, STATUS_META, PRIORITY_META, type LeadStatus, type LeadPriority } from "@/lib/leads";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props { trigger?: ReactNode; }

const empty = {
  full_name: "", email: "", phone: "", company: "", source: "Website",
  status: "new" as LeadStatus, priority: "medium" as LeadPriority,
  follow_up_date: "", message: "",
};

export function AddLeadDialog({ trigger }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const update = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) return toast.error("Name and email are required");
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone || null,
      company: form.company || null,
      source: form.source,
      status: form.status,
      priority: form.priority,
      follow_up_date: form.follow_up_date || null,
      message: form.message || null,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Lead created");
    setForm(empty);
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["leads"] });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button className="bg-gradient-primary shadow-elegant"><Plus className="mr-2 h-4 w-4" /> Add Lead</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Add new lead</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Row label="Full name *"><Input required value={form.full_name} onChange={(e) => update("full_name", e.target.value)} /></Row>
          <Row label="Email *"><Input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} /></Row>
          <Row label="Phone"><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} /></Row>
          <Row label="Company"><Input value={form.company} onChange={(e) => update("company", e.target.value)} /></Row>
          <Row label="Source">
            <Select value={form.source} onValueChange={(v) => update("source", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LEAD_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Row>
          <Row label="Status">
            <Select value={form.status} onValueChange={(v) => update("status", v as LeadStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{(Object.keys(STATUS_META) as LeadStatus[]).map((s) => <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>)}</SelectContent>
            </Select>
          </Row>
          <Row label="Priority">
            <Select value={form.priority} onValueChange={(v) => update("priority", v as LeadPriority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{(Object.keys(PRIORITY_META) as LeadPriority[]).map((p) => <SelectItem key={p} value={p}>{PRIORITY_META[p].label}</SelectItem>)}</SelectContent>
            </Select>
          </Row>
          <Row label="Follow-up date"><Input type="date" value={form.follow_up_date} onChange={(e) => update("follow_up_date", e.target.value)} /></Row>
          <div className="md:col-span-2"><Row label="Message"><Textarea rows={3} value={form.message} onChange={(e) => update("message", e.target.value)} /></Row></div>
          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-gradient-primary">{loading ? "Saving..." : "Save Lead"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
