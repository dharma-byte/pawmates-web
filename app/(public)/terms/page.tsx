import type { Metadata } from "next";
import { ContactLine, LegalPage } from "@/components/marketing/legal-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of use" };

// Plain-language draft written for the private alpha. Have it reviewed by a
// lawyer before the public beta.
export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <p>
        These terms are the rules for using {SITE.name}. By creating an account you agree to them. If you
        don&apos;t agree, please don&apos;t use {SITE.name}.
      </p>

      <h2>Who can join</h2>
      <ul>
        <li>You must be 18 or older and the owner or carer of the pet you add.</li>
        <li>You must use your real name and real photos, and pass verification before others can see you.</li>
        <li>One person, one account.</li>
      </ul>

      <h2>Be a good Pawmate</h2>
      <ul>
        <li>Be kind and respectful. No harassment, hate, threats or unwanted contact.</li>
        <li>No selling, buying or breeding-for-sale of pets. Adoption is only through verified shelters and rescues.</li>
        <li>No spam, advertising or scams, and no fake profiles or impersonation.</li>
        <li>Only post photos and content you have the right to share.</li>
        <li>Be honest about your pet&apos;s temperament and health, including vaccination.</li>
      </ul>

      <h2>Meeting in person</h2>
      <p>
        {SITE.name} helps you find other pet owners, but you decide whether and how to meet. Meet in public
        places, keep pets on a leash at first, watch how they get along, and leave if anything feels wrong.
        You are responsible for your pet&apos;s behaviour and wellbeing. We do not run background checks
        beyond our photo verification.
      </p>

      <h2>Your content</h2>
      <p>
        You own the photos and text you post. You allow us to store and show them to other members so
        {" "}{SITE.name} can work. When you delete content or your account, we stop showing it.
      </p>

      <h2>Reports, removals and bans</h2>
      <p>
        You can report and block anyone. Our team reviews reports and may remove content, ask for more
        verification, or suspend or ban accounts that break these rules, without prior notice when safety
        requires it.
      </p>

      <h2>The service</h2>
      <p>
        {SITE.name} is in early access and provided &quot;as is&quot;. Features may change, and the service may
        sometimes be unavailable. We are not responsible for what happens at meetups arranged through
        {" "}{SITE.name}, or for content posted by members, to the extent the law allows.
      </p>

      <h2>Ending your account</h2>
      <p>You can delete your account at any time in Settings → Account.</p>

      <h2>Contact</h2>
      <p>Questions about these terms? Reach us through <ContactLine />.</p>
    </LegalPage>
  );
}
