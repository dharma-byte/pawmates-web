import Link from "next/link";
import { CalendarPlus, HeartHandshake, Store, Trophy, Users } from "lucide-react";
import { SITE } from "@/lib/site";
import { buttonVariants } from "@/components/ui/button";
import { Section } from "./section";

// Events are for verified members, so the public page shows what's coming
// rather than real listings.
export function Events() {
  return (
    <Section
      id="events"
      eyebrow="Events"
      title={`Playdates and pet events in ${SITE.launchCity}`}
      intro="Group walks, breed meetups, adoption drives and training workshops, all with a real map pin."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { day: "Weekend walks", text: "Area walking groups meeting at parks you already go to." },
          { day: "Breed meetups", text: "Beagles of Bengaluru, Indie dog clubs, cat parents and more." },
          { day: "Adoption drives", text: "Verified shelters and rescues finding homes for pets." },
        ].map((event) => (
          <article key={event.day} className="grid content-start gap-2 rounded-3xl border border-dashed bg-card p-6">
            <CalendarPlus className="size-6 text-coral" aria-hidden />
            <h3 className="text-lg font-semibold">{event.day}</h3>
            <p className="text-sm text-muted-foreground">{event.text}</p>
          </article>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Events are opening soon. <Link href="/signup" className="font-medium text-primary underline underline-offset-4">Join now</Link> to host the first one in your area.
      </p>
    </Section>
  );
}

export function Organisers() {
  return (
    <Section tinted eyebrow="For organisers" title="Run a breed club, rescue or pet café?" intro="Bring your community to Pawmates and reach verified pet owners nearby.">
      <ul className="grid gap-6 md:grid-cols-3">
        {[
          { icon: Users, title: "Breed clubs and walking groups", text: "Private or public groups with chat, events and member roles." },
          { icon: HeartHandshake, title: "Shelters and rescues", text: "Verified organisations can run adoption drives. No selling of pets, ever." },
          { icon: Store, title: "Pet cafés, trainers, groomers", text: "Host workshops and meetups at your venue, pinned on the map." },
        ].map(({ icon: Icon, title, text }) => (
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

// No invented testimonials: until members share their stories, invite people
// to be the first.
export function EarlyMembers() {
  return (
    <Section eyebrow="Early members" title="Be one of the first pets in your neighbourhood">
      <div className="mx-auto grid w-full max-w-3xl gap-5 rounded-3xl bg-secondary p-8 text-center text-secondary-foreground">
        <Trophy className="mx-auto size-9 text-coral" aria-hidden />
        <p className="text-lg">
          Pawmates is in its private alpha in {SITE.launchCity}. Early members shape what we build next, and
          their pets will be the first friends everyone else meets.
        </p>
        <Link href="/signup" className={buttonVariants({ size: "lg", className: "mx-auto h-12 rounded-full px-7" })}>
          Join the alpha
        </Link>
      </div>
    </Section>
  );
}
