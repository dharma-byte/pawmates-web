import {
  BadgeCheck,
  CalendarHeart,
  EyeOff,
  Flag,
  Map,
  MapPin,
  MessageCircle,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Section } from "./section";

const STEPS = [
  { title: "Add your pet", text: "Size, energy and play style, so we can find pets who play the same way." },
  { title: "Send a Sniff request", text: "Browse verified pets nearby with a match score, and say hello." },
  { title: "Chat and meet up", text: "Become Pawmates, pick a park in chat and share the meeting spot." },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" eyebrow="How it works" title="From hello to playdate in three steps">
      <ol className="grid gap-6 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="grid content-start gap-3 rounded-3xl border bg-card p-6">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary font-heading text-lg font-bold text-teal">
              {index + 1}
            </span>
            <h3 className="text-xl font-semibold">{step.title}</h3>
            <p className="text-muted-foreground">{step.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Features() {
  return (
    <Section
      id="features"
      tinted
      eyebrow="Features"
      title="Everything your pet's social life needs"
      intro="Built only for pets, so every profile, chat and event is about them."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <FeatureCard icon={Sparkles} title="Discover with a match score" text="See verified pets within 1 to 25 km, filtered by species, size, energy and temperament.">
          <div className="flex items-center justify-between rounded-2xl bg-background p-3 shadow-sm">
            <span className="flex items-center gap-3">
              <span className="size-10 rounded-xl bg-orange/30" />
              <span><span className="block font-semibold">Luna</span><span className="block text-xs text-muted-foreground">Indie · 1.5 km</span></span>
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-sm font-bold text-primary">96%</span>
          </div>
        </FeatureCard>

        <FeatureCard icon={MessageCircle} title="Real-time chat" text="Typing, read receipts, photos and a meeting-point pin, once you're Pawmates.">
          <div className="grid gap-2 rounded-2xl bg-background p-3 text-sm shadow-sm">
            <span className="justify-self-start rounded-2xl rounded-bl-md bg-muted px-3 py-2">Park at 5 tomorrow?</span>
            <span className="justify-self-end rounded-2xl rounded-br-md bg-primary px-3 py-2 text-primary-foreground">Perfect, Luna is in!</span>
            <span className="flex items-center gap-1.5 justify-self-end text-xs text-muted-foreground"><MapPin className="size-3.5 text-coral" aria-hidden /> Meet here: Defence Colony Park</span>
          </div>
        </FeatureCard>

        <FeatureCard icon={CalendarHeart} title="Groups and events" text="Breed clubs, area walking groups, playdates and pet events with RSVP." soon>
          <div className="flex items-center gap-3 rounded-2xl bg-background p-3 text-sm shadow-sm">
            <span className="grid size-12 place-items-center rounded-xl bg-accent font-heading font-bold text-accent-foreground">SAT</span>
            <span><span className="block font-semibold">Beagle morning walk</span><span className="block text-xs text-muted-foreground">City Park · 7:00 AM</span></span>
          </div>
        </FeatureCard>

        <FeatureCard icon={Map} title="Meetup spots map" text="Dog parks, pet-friendly cafés and trails, reviewed by members: fenced, water, shade." soon>
          <div className="relative h-24 overflow-hidden rounded-2xl bg-teal/20" aria-hidden>
            <span className="absolute top-1/2 -left-4 h-2.5 w-[120%] -rotate-6 bg-background" />
            <span className="absolute top-0 left-1/3 h-full w-2 bg-background" />
            <span className="absolute top-3 left-[12%] rounded-full bg-background px-2 py-0.5 text-xs font-semibold shadow-sm">Bruno</span>
            <span className="absolute right-[14%] bottom-3 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground shadow-sm">Luna</span>
          </div>
        </FeatureCard>

        <FeatureCard icon={Radar} title="Lost and found alerts" text="Report a lost pet and everyone nearby is alerted straight away." soon className="md:col-span-2" />
      </div>
    </Section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  text,
  soon,
  className,
  children,
}: {
  icon: typeof Map;
  title: string;
  text: string;
  soon?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <article className={`grid content-start gap-4 rounded-3xl border bg-card p-6 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary">
          <Icon className="size-5 text-teal" aria-hidden />
        </span>
        {soon && <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">Coming soon</span>}
      </div>
      <div className="grid gap-1.5">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{text}</p>
      </div>
      {children}
    </article>
  );
}

const FACTORS = [
  { label: "Size", value: "Both medium", points: 30 },
  { label: "Energy", value: "Both zoomies all day", points: 30 },
  { label: "Play style", value: "Both chasers", points: 25 },
  { label: "Temperament", value: "Friendly + friendly", points: 11 },
];

// Our differentiator: the score is explained, not a black box.
export function MatchExplainer() {
  return (
    <Section
      eyebrow="Why this match?"
      title="A match score you can actually understand"
      intro="Pets who play the same way have better playdates. We show you exactly why two pets fit."
    >
      <div className="mx-auto grid w-full max-w-3xl gap-6 rounded-3xl border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-lg font-semibold">Bruno <span className="text-muted-foreground">+</span> Luna</p>
          <p className="font-heading text-4xl font-bold text-primary">96%</p>
        </div>
        <ul className="grid gap-4">
          {FACTORS.map((factor) => (
            <li key={factor.label} className="grid gap-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{factor.label} <span className="text-muted-foreground">· {factor.value}</span></span>
                <span className="text-muted-foreground">+{factor.points}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-teal" style={{ width: `${(factor.points / 30) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          Cross-species and small-dog safety are taken into account too: a dog that isn&apos;t good with cats
          won&apos;t be shown as a great match for one.
        </p>
      </div>
    </Section>
  );
}

const SAFETY = [
  { icon: BadgeCheck, title: "Every member verified", text: "A person checks a photo of each owner with their pet before anyone appears on Pawmates." },
  { icon: EyeOff, title: "Your home stays private", text: "Others see only your area and a rounded distance, never your address or exact location." },
  { icon: Flag, title: "Report and block anywhere", text: "On every profile, pet and message. Blocked members can't see you or message you." },
  { icon: ShieldCheck, title: "Safer meetups", text: "Tips before your first playdate: meet in public, keep leashes on at first, watch body language." },
];

export function Safety() {
  return (
    <Section id="safety" tinted eyebrow="Safety" title="Safety is a feature, not an afterthought" intro="People and pets meet in person, so we built trust into every step.">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SAFETY.map(({ icon: Icon, title, text }) => (
          <li key={title} className="grid content-start gap-3 rounded-3xl border bg-card p-6">
            <Icon className="size-7 text-teal" aria-hidden />
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
