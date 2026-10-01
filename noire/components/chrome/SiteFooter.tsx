import { NoireFooter } from "@/components/sections";
import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <NoireFooter
      wordmark={site.wordmark}
      descriptor={`${site.descriptor} ${site.city}, working everywhere.`}
      email={site.email}
      pages={[{ label: "Home", link: "/" }, ...site.nav.map((n) => ({ label: n.label, link: n.href }))]}
      studio={site.footerNav.map((n) => ({ label: n.label, link: n.href }))}
      social={site.social.map((n) => ({ label: n.label, link: n.href }))}
      legal={site.legalNav.map((n) => ({ label: n.label, link: n.href }))}
      note={`© 2026 ${site.legalName}. Built with the NOIRÉ 2 system, v${site.version}.`}
    />
  );
}
