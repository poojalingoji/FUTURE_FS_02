import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — LeadFlow CRM" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account created!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex flex-col p-8">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold tracking-tight">Create your workspace</h1>
            <p className="mt-2 text-sm text-muted-foreground">Start managing leads in under a minute.</p>

            <form onSubmit={handle} className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <Label>Full name</Label>
                <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Smith" />
              </div>
              <div className="space-y-1.5">
                <Label>Work email</Label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <Input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} size="lg" className="w-full bg-gradient-primary shadow-elegant">
                {loading ? "Creating..." : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-gradient-hero md:block">
        <div className="absolute inset-0 grid place-items-center p-12">
          <div className="max-w-md text-primary-foreground">
            <h2 className="text-4xl font-bold leading-tight">Built for sales teams who ship.</h2>
            <p className="mt-4 opacity-80">Join thousands of teams growing pipeline with LeadFlow.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
