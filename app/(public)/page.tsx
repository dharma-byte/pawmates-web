import Link from "next/link";
import { CalendarHeart, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { buttonVariants } from "@/components/ui/button";

const FEATURES = [
  {
    icon: MapPin,
    title: "Find pet friends nearby",
    text: "Discover verified pets within a few kilometres, matched on size, energy and play style.",
  },
  {
    icon: MessageCircle,
    title: "Chat in real time",
    text: "Send a Sniff request, become Pawmates, and plan a playdate in chat.",
  },
  {
    icon: CalendarHeart,
    title: "Groups and events",
    text: "Join breed clubs and area walking groups, and RSVP to local pet events.",
  },
  {
    icon: ShieldCheck,
    title: "Verified and safe",
    text: "Every member is verified with a photo of them and their pet. Your exact location stays private.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <Logo />
        <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
          Sign in
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 py-12">
        <section className="flex flex-col items-start gap-6 sm:items-center sm:text-center">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Where pets{" "}
            <span className="bg-linear-to-r from-orange to-coral bg-clip-text text-transparent">
              make friends
            </span>
            , and so do their humans.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground text-pretty">
            Pawmates is a free, pets-only community. Find compatible playmates near you, chat,
            join groups and organise playdates.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/signup" className={buttonVariants({ size: "lg", className: "h-11 px-6" })}>
              Join Pawmates
            </Link>
            <Link
              href="/login"
              className={buttonVariants({ size: "lg", variant: "outline", className: "h-11 px-6" })}
            >
              I already have an account
            </Link>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4 rounded-xl border p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Icon className="size-5 text-teal" aria-hidden />
              </span>
              <div className="grid gap-1">
                <h2 className="font-medium">{title}</h2>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-5xl gap-4 px-4 py-6 text-sm text-muted-foreground">
        <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
        <Link href="/terms" className="hover:text-foreground">Terms</Link>
      </footer>
    </div>
  );
}
