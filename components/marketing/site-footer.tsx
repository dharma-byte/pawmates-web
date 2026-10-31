import Link from "next/link";
import { HOME_SECTIONS, SITE } from "@/lib/site";
import { Logo } from "@/components/shared/logo";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid content-start gap-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">{SITE.tagline}</p>
        </div>
        <FooterColumn title="Explore">
          {HOME_SECTIONS.map(({ id, label }) => (
            <FooterLink key={id} href={`/#${id}`}>
              {label}
            </FooterLink>
          ))}
        </FooterColumn>
        <FooterColumn title="Account">
          <FooterLink href="/signup">Join free</FooterLink>
          <FooterLink href="/login">Sign in</FooterLink>
        </FooterColumn>
        <FooterColumn title="Legal">
          <FooterLink href="/privacy">Privacy policy</FooterLink>
          <FooterLink href="/terms">Terms of use</FooterLink>
          <FooterLink href="/#safety">Safety</FooterLink>
        </FooterColumn>
      </div>
      <p className="mx-auto w-full max-w-6xl px-4 pb-8 text-xs text-muted-foreground">
        © {SITE.copyrightYear} {SITE.name}. Made for pets.
      </p>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid content-start gap-2">
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="grid gap-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-muted-foreground hover:text-foreground">
        {children}
      </Link>
    </li>
  );
}
