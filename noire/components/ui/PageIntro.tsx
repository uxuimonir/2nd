/** Page / Intro — label, page title (the page's only h1) and lede. */
export function PageIntro({
  label,
  title,
  lede,
  children,
}: {
  label: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="container page-intro">
      <p className="page-intro__label t-label t-muted" data-reveal>
        {label}
      </p>
      <div className="page-intro__body">
        <h1
          className="page-intro__title t-display-l"
          data-reveal
          style={{ "--reveal-delay": "60ms" } as React.CSSProperties}
        >
          {title}
        </h1>
        {lede ? (
          <p
            className="page-intro__lede t-body-l"
            data-reveal
            style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
          >
            {lede}
          </p>
        ) : null}
      </div>
      {children}
    </header>
  );
}
