import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { LEAD_SOURCES } from "@/lib/leads";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — LeadFlow CRM" },
      { name: "description", content: "Get in touch with the LeadFlow team. We'll get back to you within 24 hours." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Name is too short").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  source: z.string().min(1),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { source: "Website" },
  });

  const onSubmit = async (values: FormValues) => {
    const { error } = await supabase.from("leads").insert({
      full_name: values.full_name,
      email: values.email,
      phone: values.phone || null,
      company: values.company || null,
      source: values.source,
      message: values.message || null,
    });
    if (error) {
      toast.error("Failed to submit. Please try again.");
      return;
    }
    toast.success("Thanks! We'll be in touch soon.");
    setSubmitted(true);
    reset({ source: "Website" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Let's <span className="text-gradient">talk.</span></h1>
          <p className="mt-3 text-muted-foreground">Tell us about your team. We'll reach out within one business day.</p>
        </div>

        <div className="mt-10 rounded-2xl border bg-card p-8 shadow-card">
          {submitted ? (
            <div className="py-10 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-xl font-semibold">Message received</h2>
              <p className="mt-2 text-sm text-muted-foreground">Our team will reply within 24 hours.</p>
              <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>Submit another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Full name" error={errors.full_name?.message}>
                  <Input placeholder="Jane Smith" {...register("full_name")} />
                </Field>
                <Field label="Email" error={errors.email?.message}>
                  <Input type="email" placeholder="jane@company.com" {...register("email")} />
                </Field>
                <Field label="Phone (optional)" error={errors.phone?.message}>
                  <Input placeholder="+1 555 000 0000" {...register("phone")} />
                </Field>
                <Field label="Company (optional)" error={errors.company?.message}>
                  <Input placeholder="Acme Inc" {...register("company")} />
                </Field>
              </div>
              <Field label="How did you hear about us?">
                <Select value={watch("source")} onValueChange={(v) => setValue("source", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Message (optional)" error={errors.message?.message}>
                <Textarea rows={4} placeholder="Tell us a bit about your needs..." {...register("message")} />
              </Field>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-primary shadow-elegant" size="lg">
                {isSubmitting ? "Sending..." : <>Send message <Send className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
