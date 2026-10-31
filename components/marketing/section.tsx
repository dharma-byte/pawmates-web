import { cn } from "cn";

// A homepage section the navbar can scroll to. scroll-mt keeps the heading
// clear of the sticky header.
export function Section({
  id,
  eyebrow,
  title,
  intro,
  tinted,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  tinted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={cn("scroll-mt-20 py-16 sm:py-24", tinted && "bg-muted/50")}>
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4">
        <div className="mx-auto grid max-w-2xl gap-3 text-center">
          {eyebrow && <p className="text-sm font-semibold tracking-wide text-teal uppercase">{eyebrow}</p>}
          <h2 id={id ? `${id}-title` : undefined} className="text-3xl font-bold text-balance sm:text-4xl">
            {title}
          </h2>
          {intro && <p className="text-lg text-pretty text-muted-foreground">{intro}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
