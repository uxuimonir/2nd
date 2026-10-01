import type { Metadata } from "next";
import { Media } from "@/components/media/Media";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/** 404 — a visual dead-end that is actually a way forward. */
export default function NotFound() {
  return (
    <section className="notfound theme-inverse" aria-labelledby="nf-title">
      <div className="notfound__media">
        <Media id="notfound" ratio="wide" sizes="100vw" decorative priority />
      </div>
      <div className="container notfound__body">
        <p className="t-label" style={{ color: "var(--color-muted)" }}>
          Error 404
        </p>
        <h1 id="nf-title" className="notfound__code">
          404
        </h1>
        <p className="notfound__text t-body-l">
          This room is empty — the page may have moved, or the link was mistyped. The work is still
          here.
        </p>
        <div className="notfound__actions">
          <ButtonLink href="/">Back home</ButtonLink>
          <ButtonLink href="/work" variant="secondary">
            View work
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
