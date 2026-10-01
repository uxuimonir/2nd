"use client";

import { useEffect, useState } from "react";

function format(timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(new Date());
}

/** Live studio clock, rendered client-side only to avoid hydration drift. */
export function LocalTime({ timeZone }: { timeZone: string }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    setTime(format(timeZone));
    const id = window.setInterval(() => setTime(format(timeZone)), 20_000);
    return () => window.clearInterval(id);
  }, [timeZone]);
  return (
    <time
      className="t-meta"
      style={{ fontVariantNumeric: "tabular-nums" }}
      aria-label="Local studio time"
    >
      {time ?? "—:—"}
    </time>
  );
}
