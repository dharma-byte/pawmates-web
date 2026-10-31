// Public facts about Pawmates, used by the marketing and legal pages.
// TODO before the public beta: set a contact address and a named grievance
// officer (required under India's DPDP Act). Until then the legal pages point
// people to the in-app Report option.
export const SITE = {
  name: "Pawmates",
  tagline: "Where pets make friends, and so do their humans.",
  contactEmail: null as string | null,
  grievanceOfficer: null as string | null,
  legalUpdated: "31 October 2026",
  copyrightYear: 2026,
};

// Homepage sections the navbar links to, in page order.
export const HOME_SECTIONS = [
  { id: "how-it-works", label: "How it works" },
  { id: "features", label: "Features" },
  { id: "safety", label: "Safety" },
  { id: "events", label: "Events" },
  { id: "faq", label: "FAQ" },
] as const;
