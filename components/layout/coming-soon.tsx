import type { LucideIcon } from "lucide-react";

// Placeholder for app sections that are not built yet, so navigation never 404s.
export function ComingSoon({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="grid justify-items-center gap-3 py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary">
        <Icon className="size-7 text-teal" aria-hidden />
      </span>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="max-w-sm text-muted-foreground">{text}</p>
      <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
        Coming next
      </span>
    </div>
  );
}
