import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-elegant">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M14 7h7v7" />
        </svg>
      </span>
      <span className="text-lg">LeadFlow <span className="text-primary">CRM</span></span>
    </Link>
  );
}
