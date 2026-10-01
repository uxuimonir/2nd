import { ViewTransition } from "react";

/**
 * Page transition — one family across every route: the outgoing page fades
 * quickly, the incoming page rises 16px and fades in (see styles/motion.css).
 * Wrap each page's content; layouts persist so they never animate.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
