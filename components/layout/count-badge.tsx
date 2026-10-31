import { cn } from "cn";

export function CountBadge({ count, floating }: { count: number; floating?: boolean }) {
  if (count === 0) return null;
  return (
    <span
      className={cn(
        "min-w-4 rounded-full bg-coral px-1 text-center text-[10px] leading-4 font-semibold text-white",
        floating && "absolute -top-1.5 -right-2.5",
      )}
    >
      {count > 9 ? "9+" : count}
      <span className="sr-only"> new</span>
    </span>
  );
}
