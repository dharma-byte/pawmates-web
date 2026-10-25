import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

// Deliberately vague: the page may be missing, unverified, or blocked.
export function NotAvailable({ what }: { what: "profile" | "pet" }) {
  return (
    <div className="grid justify-items-center gap-3 py-20 text-center">
      <SearchX className="size-10 text-muted-foreground" aria-hidden />
      <h1 className="text-xl font-bold">This {what} isn&apos;t available</h1>
      <p className="max-w-sm text-muted-foreground">It may have been removed, or it isn&apos;t visible to you.</p>
      <Link href="/discover" className={buttonVariants({ variant: "outline" })}>
        Back to Discover
      </Link>
    </div>
  );
}
