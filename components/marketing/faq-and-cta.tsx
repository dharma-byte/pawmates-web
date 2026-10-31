import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section } from "./section";

const FAQS = [
  { q: "Is Pawmates free?", a: "Yes. Profiles, discovery, chat and groups are free. Optional extras may come later, but the core will stay free." },
  { q: "Is Pawmates only for dogs?", a: "Pawmates is built for dogs: walks, parks, playdates and group meetups. Cat owners are welcome to join, but matching, groups and events are designed around dogs." },
  { q: "Why do I need to be verified?", a: "People and pets meet in person, so a person on our team checks a photo of you with your pet before your profile is visible. It usually takes less than a day." },
  { q: "Who can see where I live?", a: "Nobody. Others see only your area name and a rounded distance like “about 2 km away”, calculated from a point moved away from your real location." },
  { q: "Where can I use Pawmates?", a: "Wherever you and your dog live. Pawmates shows verified dogs, groups and events near the area you set, so the more neighbours join, the more friends there are to meet." },
  { q: "Can I sell or buy pets here?", a: "No. Pawmates never allows pet sales. Adoption listings will come only from verified shelters and rescues." },
];

export function Faq() {
  return (
    <Section id="faq" tinted eyebrow="FAQ" title="Questions dog parents ask us">
      <div className="mx-auto grid w-full max-w-3xl gap-3">
        {FAQS.map(({ q, a }) => (
          <details key={q} className="group rounded-2xl border bg-card px-5 py-4 open:shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              {q}
              <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className="pt-3 text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

export function FinalCta() {
  return (
    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 rounded-[2rem] bg-primary p-8 text-primary-foreground sm:p-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid max-w-2xl gap-2">
          <h2 className="text-3xl font-bold text-balance">Your pet&apos;s next best friend might live on your street.</h2>
          <p className="text-primary-foreground/80">Free to join. Verified members only.</p>
        </div>
        <Link href="/signup" className={buttonVariants({ variant: "secondary", size: "lg", className: "h-12 shrink-0 rounded-full px-7" })}>
          Create my free account
        </Link>
      </div>
    </section>
  );
}
