export type LeadStatus = "new" | "contacted" | "converted" | "lost";
export type LeadPriority = "low" | "medium" | "high";

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  source: string;
  message: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export const LEAD_SOURCES = [
  "Website",
  "LinkedIn",
  "Referral",
  "Instagram",
  "Google Ads",
  "Email Campaign",
  "Other",
];

export const STATUS_META: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-info/15 text-info border-info/30" },
  contacted: { label: "Contacted", className: "bg-warning/15 text-warning-foreground border-warning/30" },
  
  converted: { label: "Converted", className: "bg-success/15 text-success border-success/30" },
  lost: { label: "Lost", className: "bg-destructive/10 text-destructive border-destructive/30" },
};

export const PRIORITY_META: Record<LeadPriority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", className: "bg-info/15 text-info" },
  high: { label: "High", className: "bg-destructive/15 text-destructive" },
};

export function exportLeadsToCsv(leads: Lead[]) {
  const headers = ["Name","Email","Phone","Company","Source","Status","Priority","Follow-up","Created"];
  const rows = leads.map((l) => [
    l.full_name, l.email, l.phone ?? "", l.company ?? "", l.source,
    l.status, l.priority, l.follow_up_date ?? "", new Date(l.created_at).toISOString(),
  ]);
  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
