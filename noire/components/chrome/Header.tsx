"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { isActive } from "@/lib/nav";
import { LocalTime } from "./LocalTime";
import { MobileMenu } from "./MobileMenu";

/** Micro header — Nav / Desktop + trigger for Nav / Mobile. */
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    menuButton.current?.focus();
  }, []);

  return (
    <>
      <header className="header" data-scrolled={scrolled}>
        <div className="container header__inner">
          <Link href="/" className="header__brand" aria-label={`${site.name} — home`}>
            <span className="header__wordmark">{site.wordmark}</span>
          </Link>

          <div className="header__meta" aria-label="Studio status">
            <span className="status">
              <span
                className={`status__dot${site.availability.open ? "" : " status__dot--closed"}`}
                aria-hidden="true"
              />
              {site.availability.label}
            </span>
            <span>
              {site.city} <LocalTime timeZone={site.timeZone} />
            </span>
          </div>

          <nav className="header__nav" aria-label="Primary">
            <ul role="list">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="header__link"
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <button
            ref={menuButton}
            type="button"
            className="header__menu-btn"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(true)}
          >
            Menu
            <span className="header__menu-icon" aria-hidden="true" />
          </button>
        </div>
      </header>
      {/* Rendered outside the header: its backdrop-filter would trap position: fixed. */}
      <MobileMenu open={open} onClose={close} pathname={pathname} />
    </>
  );
}
