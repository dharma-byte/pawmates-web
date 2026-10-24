import Link from "next/link";
import { PawPrint } from "lucide-react";
import { cn } from "cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <PawPrint className="size-4" aria-hidden />
      </span>
      Pawmates
    </Link>
  );
}
