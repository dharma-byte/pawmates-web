import { SITE } from "@/lib/site";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader onHome={false} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated {SITE.legalUpdated}</p>
        <div className="mt-8 grid gap-6 leading-relaxed [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_ul]:grid [&_ul]:gap-1.5">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

// How to reach us: the configured address, else the in-app Report option.
export function ContactLine() {
  return SITE.contactEmail ? (
    <a href={`mailto:${SITE.contactEmail}`} className="font-medium text-primary underline underline-offset-4">
      {SITE.contactEmail}
    </a>
  ) : (
    <span>the Report option inside the app (a dedicated contact address is coming soon)</span>
  );
}
