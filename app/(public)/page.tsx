import { Events, EarlyMembers, Organisers } from "@/components/marketing/community-sections";
import { Faq, FinalCta } from "@/components/marketing/faq-and-cta";
import { Hero } from "@/components/marketing/hero";
import { Features, HowItWorks, MatchExplainer, Safety } from "@/components/marketing/product-sections";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

// The public homepage: everything about Pawmates on one page, with the navbar
// jumping between sections. Signed-in members get the app instead (/home).
export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <MatchExplainer />
        <Safety />
        <Events />
        <Organisers />
        <EarlyMembers />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
