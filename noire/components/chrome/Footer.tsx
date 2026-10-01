import Link from "next/link";
import { site } from "@/content/site";
import { ButtonLink } from "@/components/ui/ButtonLink";

/** Footer / Colophon — wordmark, navigation, socials, legal, production note. */
export function Footer() {
  const year = 2026;
  return (
    <footer className="footer theme-inverse" aria-labelledby="footer-title">
      <div className="container">
        <h2 id="footer-title" className="visually-hidden">
          Site footer
        </h2>
        <div className="footer__grid">
          <div className="footer__intro">
            <p className="t-body-l">
              {site.descriptor} Based in {site.location}, working everywhere.
            </p>
            <ButtonLink href="/contact" variant="text">
              Start a project
            </ButtonLink>
          </div>
          <nav className="footer__col" aria-labelledby="footer-pages">
            <h2 id="footer-pages" className="t-label">
              Pages
            </h2>
            <ul role="list">
              <li>
                <Link href="/">Home</Link>
              </li>
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav className="footer__col" aria-labelledby="footer-more">
            <h2 id="footer-more" className="t-label">
              Studio
            </h2>
            <ul role="list">
              {site.footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
            </ul>
          </nav>
          <div className="footer__col">
            <h2 className="t-label">Elsewhere</h2>
            <ul role="list">
              {site.social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}{" "}
                    <span className="external-mark" aria-hidden="true">
                      ↗
                    </span>
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Link href="/" className="footer__wordmark" aria-label={`${site.name} — back to home`}>
          {site.wordmark}
        </Link>
        <div className="footer__bottom t-meta">
          <p>
            © {year} {site.legalName}. Built with the NOIRÉ 2 system, v{site.version}.
          </p>
          <ul role="list">
            {site.legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/colophon">Colophon</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
