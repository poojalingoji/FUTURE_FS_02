import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { isBrowserNotifyEnabled, setBrowserNotifyEnabled } from "@/hooks/use-follow-up-notifications";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — LeadFlow CRM" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const [fullName, setFullName] = useState("");
  const [pw, setPw] = useState("");
  const [notify, setNotify] = useState(true);
  const [browserNotify, setBrowserNotify] = useState(false);

  useEffect(() => {
    setBrowserNotify(isBrowserNotifyEnabled());
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).single()
      .then(({ data }) => setFullName(data?.full_name ?? ""));
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
  };

  const changePassword = async () => {
    if (pw.length < 6) return toast.error("Password must be at least 6 characters");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return toast.error(error.message);
    setPw("");
    toast.success("Password changed");
  };

  const enableBrowserNotif = async () => {
    if (!("Notification" in window)) return toast.error("Notifications not supported");
    const perm = await Notification.requestPermission();
    const granted = perm === "granted";
    setBrowserNotify(granted);
    setBrowserNotifyEnabled(granted);
    if (granted) {
      new Notification("LeadFlow CRM", { body: "Browser notifications enabled. You'll be reminded of follow-ups." });
      toast.success("Browser notifications enabled");
    } else {
      toast.error("Permission denied — enable notifications in your browser settings");
    }
  };

  const disableBrowserNotif = () => {
    setBrowserNotify(false);
    setBrowserNotifyEnabled(false);
    toast.success("Browser notifications disabled");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your profile and preferences.</p>
      </div>

      <Section title="Admin profile" desc="Your personal information.">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <Button onClick={saveProfile} className="bg-gradient-primary">Save profile</Button>
        </div>
      </Section>

      <Section title="Change password" desc="Use a strong, unique password.">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>New password</Label>
            <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 6 characters" />
          </div>
          <Button onClick={changePassword} className="bg-gradient-primary">Update password</Button>
        </div>
      </Section>

      <Section title="Preferences" desc="Notifications and appearance.">
        <div className="space-y-5">
          <Row label="Email notifications" desc="Get notified by email about new leads.">
            <Switch checked={notify} onCheckedChange={setNotify} />
          </Row>
          <Row label="Browser notifications" desc="Show desktop notifications for follow-up reminders.">
            <Switch checked={browserNotify} onCheckedChange={(v) => v ? enableBrowserNotif() : disableBrowserNotif()} />
          </Row>
          <Row label="Dark mode" desc="Switch between light and dark theme.">
            <Switch checked={theme === "dark"} onCheckedChange={toggle} />
          </Row>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {children}
    </div>
  );
}
