"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// False during server rendering and hydration, true afterwards. Use it to hold
// back UI built from data the browser may already have cached (shared React
// Query keys), so the first client render matches the server HTML.
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
