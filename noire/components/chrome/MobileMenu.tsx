"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { site } from "@/content/site";
import { isActive } from "@/lib/nav";

/**
 * Nav / Mobile — full-screen overlay. Modal semantics, focus trapped while
 * open, Escape closes, focus returns to the Menu button, closes on route change.
 */
export function MobileMenu({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const lastPath = useRef(pathname);

  // Close after navigation completes.
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      if (open) onClose();
    }
  }, [pathname, open, onClose]);

  useEffect(() => {
    if (!open) return;
    const root = panel.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = () =>
      Array.from(root?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab") {
        const items = focusables();
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const onResize = () => window.innerWidth >= 900 && onClose();
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, onClose]);

  const links = [{ label: "Home", href: "/" }, ...site.nav];

  return (
    <div
      id="site-menu"
      ref={panel}
      className="menu theme-inverse"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      data-open={open}
      inert={!open}
    >
      <div className="container menu__top">
        <Link href="/" className="header__brand" onClick={onClose}>
          <span className="header__wordmark">{site.wordmark}</span>
        </Link>
        <button
          type="button"
          className="header__menu-btn"
          onClick={onClose}
          style={{ display: "inline-flex" }}
        >
          Close
        </button>
      </div>
      <nav className="container menu__list" aria-label="Mobile">
        <ul role="list">
          {links.map((item, i) => (
            <li key={item.href} className="menu__item">
              <Link
                href={item.href}
                className="menu__link"
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                onClick={() => pathname === item.href && onClose()}
              >
                <span className="menu__index">{String(i + 1).padStart(2, "0")}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="container menu__foot">
        <span className="status t-muted">
          <span className="status__dot" aria-hidden="true" />
          {site.availability.label}
        </span>
        <a href={`mailto:${site.email}`} className="t-body-l">
          {site.email}
        </a>
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
  );
}
