import type { Metadata } from "next";
import { ContactLine, LegalPage } from "@/components/marketing/legal-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy" };

// Plain-language draft written for the private alpha. Have it reviewed by a
// lawyer before the public beta (GDPR, India's DPDP Act 2023).
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <p>
        {SITE.name} is a community for pets and their people. This policy explains what we collect, why,
        who can see it, and the choices you have. We wrote it in plain language on purpose.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account:</strong> your email address and a password (stored only as a secure hash).</li>
        <li><strong>Profile:</strong> your name, username, profile photo, short bio and the area you choose.</li>
        <li><strong>Location:</strong> the point you set during onboarding. We store it privately.</li>
        <li><strong>Your pets:</strong> their photos and details such as species, breed, size, temperament and vaccination status.</li>
        <li><strong>Verification:</strong> a photo of you and a photo of you with your pet.</li>
        <li><strong>Activity:</strong> Sniff requests, chats and messages, blocks and reports you make.</li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To run Pawmates: show you nearby pets, calculate match scores, deliver chats and requests.</li>
        <li>To keep the community safe: verify members, review reports and remove people who break the rules.</li>
        <li>To send account emails, such as confirming your email address or signing you in.</li>
      </ul>
      <p>We do not sell your personal data, and we do not show third-party advertising.</p>

      <h2>Who can see what</h2>
      <ul>
        <li>Only verified members can see other members, their pets and groups.</li>
        <li>Your exact location is never shown. Others see your area name (you can hide it) and a rounded distance worked out from a point moved 500 m to 1 km away from where you are.</li>
        <li>Verification photos are private: only you and the {SITE.name} team can see them.</li>
        <li>Messages are visible only to the people in that conversation. Our team can read a message only if someone reports it.</li>
        <li>People you block cannot see your profile or pets, or contact you.</li>
      </ul>

      <h2>Services we use</h2>
      <p>
        We use trusted providers to run {SITE.name}: Supabase (database, sign-in and file storage, hosted in
        Mumbai, India), Vercel (website hosting), Brevo (sending account emails) and OpenStreetMap (maps
        and place search). They process data only to provide their service to us.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your data while your account is open. When you delete your account, your profile, pets,
        photos, Sniff requests and the messages you sent are deleted. Some records, such as reports about
        safety issues, may be kept for a limited time where needed to protect the community.
      </p>

      <h2>Your rights and choices</h2>
      <ul>
        <li><strong>See and download your data:</strong> Settings → Account → Download my data.</li>
        <li><strong>Correct it:</strong> edit your profile and pets in Settings at any time.</li>
        <li><strong>Delete it:</strong> Settings → Account → Delete account.</li>
        <li><strong>Control visibility:</strong> choose who can message you, and whether to show your area and online status.</li>
      </ul>

      <h2>Children</h2>
      <p>{SITE.name} is for people aged 18 and over. We do not knowingly collect data from children.</p>

      <h2>Questions and complaints</h2>
      <p>
        Reach us through <ContactLine />.
        {SITE.grievanceOfficer && <> Our grievance officer is {SITE.grievanceOfficer}.</>}
      </p>

      <h2>Changes</h2>
      <p>If we make important changes to this policy, we will tell you in the app before they take effect.</p>
    </LegalPage>
  );
}
