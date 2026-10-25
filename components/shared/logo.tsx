import Image from "next/image";
import Link from "next/link";
import { cn } from "cn";

// Paw mark + "Pawmates" wordmark in Poppins Bold: "Paw" in navy, "mates" in coral.
export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Pawmates home"
      className={cn("inline-flex items-center gap-2 font-heading text-xl font-bold", className)}
    >
      <Image src="/brand/pawmates-mark.svg" alt="" width={32} height={32} priority />
      <span aria-hidden>
        <span className="text-primary">Paw</span>
        <span className="text-coral">mates</span>
      </span>
    </Link>
  );
}
