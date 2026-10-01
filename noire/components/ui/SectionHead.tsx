import { ButtonLink } from "./ButtonLink";

/** Section / Header — small editorial label, optional destination link. */
export function SectionHead({
  number,
  title,
  link,
  id,
}: {
  number?: string;
  title: string;
  link?: { href: string; label: string };
  id?: string;
}) {
  return (
    <div className="section-head">
      <h2 className="section-head__label t-label" id={id}>
        {number ? <span className="section-head__num">{number}</span> : null}
        <span>{title}</span>
      </h2>
      {link ? (
        <ButtonLink href={link.href} variant="text">
          {link.label}
        </ButtonLink>
      ) : null}
    </div>
  );
}
