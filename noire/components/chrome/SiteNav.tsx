"use client";

import { usePathname } from "next/navigation";
import { NoireNav } from "@/components/sections";
import { site } from "@/content/site";

/** Fixed nav: transparent over the dark home hero, cream bar everywhere else. */
export function SiteNav() {
  const pathname = usePathname();
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 60 }}>
      <NoireNav
        key={pathname}
        wordmark={site.wordmark}
        links={site.nav.map((n) => ({ label: n.label, link: n.href }))}
        status={site.availability.label}
        city={site.city}
        timeZone={site.timeZone}
        email={site.email}
        overDark={pathname === "/"}
      />
    </div>
  );
}
