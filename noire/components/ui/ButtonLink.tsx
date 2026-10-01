import Link from "next/link";

type Variant = "primary" | "secondary" | "text";

/**
 * Button / Primary, Button / Secondary, Button / Text.
 * Navigation always renders a real link; actions use <button> elsewhere.
 */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  external,
  arrow = true,
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  external?: boolean;
  arrow?: boolean;
  className?: string;
}) {
  const cls =
    variant === "text" ? ["link-arrow", className] : ["btn", `btn--${variant}`, className];
  const icon = external ? "↗" : "→";
  const content = (
    <>
      {children}
      {arrow ? (
        <span className={variant === "text" ? "link-arrow__icon" : "btn__arrow"} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {external ? <span className="visually-hidden"> (opens in a new tab)</span> : null}
    </>
  );
  const isMail = href.startsWith("mailto:");
  if (external || isMail) {
    return (
      <a
        href={href}
        className={cls.filter(Boolean).join(" ")}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls.filter(Boolean).join(" ")}>
      {content}
    </Link>
  );
}
