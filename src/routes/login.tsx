import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — LeadFlow CRM" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left panel */}
      <div className="flex flex-col p-8">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to your LeadFlow workspace.</p>

            <form onSubmit={handle} className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <Input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <button type="button" onClick={() => toast.info("Password reset link will be sent if the email exists.")} className="text-primary hover:underline">Forgot password?</button>
              </div>
              <Button type="submit" disabled={loading} size="lg" className="w-full bg-gradient-primary shadow-elegant">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              No account? <Link to="/signup" className="font-medium text-primary hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="relative hidden overflow-hidden bg-gradient-hero md:block">
        <div className="absolute inset-0 grid place-items-center p-12">
          <div className="max-w-md text-primary-foreground">
            <p className="text-xs uppercase tracking-widest opacity-70">LeadFlow CRM</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight">Every lead, every conversation, in one place.</h2>
            <p className="mt-4 opacity-80">The CRM your team will actually use. Beautiful by design, fast by default.</p>
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[["2.8k", "Leads"], ["23%", "Conversion"], ["4.9★", "Reviews"]].map(([v,l]) => (
                <div key={l} className="rounded-xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-bold">{v}</p>
                  <p className="text-xs opacity-80">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
