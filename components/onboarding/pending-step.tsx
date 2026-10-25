import Link from "next/link";
import { Hourglass, PartyPopper } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function PendingStep() {
  return (
    <div className="grid gap-4 text-center">
      <Hourglass className="mx-auto size-12 text-teal" aria-hidden />
      <h1 className="text-2xl font-bold">We&apos;re reviewing your profile</h1>
      <p className="text-muted-foreground">
        A member of the Pawmates team checks every new account, usually within a day. This page
        updates by itself when you&apos;re approved.
      </p>
      <div className="grid gap-1 rounded-xl bg-secondary p-4 text-left text-sm text-secondary-foreground">
        <p className="font-medium">While you wait</p>
        <ul className="list-disc pl-5">
          <li>Check your email for our approval message</li>
          <li>Think about which parks your pet loves most</li>
        </ul>
      </div>
    </div>
  );
}

export function DoneStep() {
  return (
    <div className="grid gap-4 text-center">
      <PartyPopper className="mx-auto size-12 text-coral" aria-hidden />
      <h1 className="text-2xl font-bold">You&apos;re verified!</h1>
      <p className="text-muted-foreground">Welcome to Pawmates. Let&apos;s find your pet some friends.</p>
      <Link href="/home" className={buttonVariants({ size: "lg", className: "h-11" })}>
        Go to Pawmates
      </Link>
    </div>
  );
}
