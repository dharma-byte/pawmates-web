"use client";

import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useHydrated } from "@/hooks/use-hydrated";

// For pages reading data the app shell also loads (me, the chat inbox, my
// connections). The shell can fill the cache before a page segment hydrates,
// so a plain useQuery would render that data on the page's first client
// render while the server HTML had none: a hydration mismatch. This reports
// "still loading" until hydration is done, then behaves like useQuery.
export function useSharedQuery<TData>(options: { queryKey: QueryKey; queryFn: () => Promise<TData> }) {
  const hydrated = useHydrated();
  const query = useQuery(options);
  return {
    data: hydrated ? query.data : undefined,
    isPending: !hydrated || query.isPending,
    error: hydrated ? query.error : null,
  };
}
