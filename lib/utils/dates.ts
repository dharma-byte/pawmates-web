// Inbox and chat timestamps: "14:05" today, "Yesterday", weekday this week,
// otherwise a short date.
export function formatChatTime(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  if (date.getTime() >= startOfToday) {
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  if (date.getTime() >= startOfToday - dayMs) return "Yesterday";
  if (date.getTime() >= startOfToday - 6 * dayMs) {
    return date.toLocaleDateString(undefined, { weekday: "short" });
  }
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function sameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export function formatDayDivider(iso: string) {
  const label = formatChatTime(iso);
  return label.includes(":") ? "Today" : new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}
