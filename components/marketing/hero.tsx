import { MapPin, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PetTile } from "./pet-tile";

export function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-10 pb-16 lg:grid-cols-2 lg:pt-16 lg:pb-24">
      <div className="grid gap-6">
        <span className="inline-flex items-center gap-2 justify-self-start rounded-full bg-secondary px-3.5 py-1.5 text-sm font-medium text-secondary-foreground">
          <ShieldCheck className="size-4 text-teal" aria-hidden />
          Every member is verified by a person
        </span>
        <h1 className="text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl">
          Where dogs make friends, and so do their{" "}
          <span className="bg-linear-to-r from-orange to-coral bg-clip-text text-transparent">humans</span>.
        </h1>
        <p className="max-w-xl text-lg text-pretty text-muted-foreground">
          Find compatible playmates for your dog nearby, chat in real time, and plan walks and playdates
          at the parks your dog already loves. Free, and made for dogs and their people.
        </p>

        {/* Area search leads into sign-up; results are for verified members only. */}
        <form action="/signup" method="get" className="flex max-w-xl flex-col gap-2 rounded-2xl border bg-card p-2 shadow-sm sm:flex-row">
          <label htmlFor="hero-area" className="sr-only">
            Your area
          </label>
          <div className="flex flex-1 items-center gap-2 px-3">
            <MapPin className="size-5 shrink-0 text-teal" aria-hidden />
            <input
              id="hero-area"
              name="area"
              placeholder="Your neighbourhood and city"
              className="h-11 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Button type="submit" size="lg" className="h-12 rounded-xl px-6">
            <Search aria-hidden /> Find pet friends
          </Button>
        </form>

        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 text-teal" aria-hidden />
          Your exact home location is never shown to anyone.
        </p>
      </div>

      <div className="relative grid grid-cols-2 gap-4" aria-hidden>
        <PetTile name="Bruno" detail="Golden Retriever" tone="peach" photo="/pets/bruno.webp" className="h-60" />
        <PetTile name="Pepper" detail="Papillon" tone="mint" photo="/pets/pepper.webp" className="mt-6 h-44" />
        <PetTile name="Rocky" detail="English Pointer" tone="sky" photo="/pets/rocky.webp" className="h-48" />
        <PetTile name="Luna" detail="Indie · 2 km away" tone="sun" photo="/pets/luna.webp" className="h-60" />
        <div className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-card px-4 py-3 shadow-lg sm:block">
          <p className="text-xs text-muted-foreground">Bruno + Luna</p>
          <p className="font-heading text-lg font-bold text-primary">96% match</p>
        </div>
      </div>
    </section>
  );
}
