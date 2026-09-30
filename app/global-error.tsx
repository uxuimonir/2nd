"use client";

/** Last-resort boundary (renders its own document). */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#07090a", color: "#f3ede1", fontFamily: "Georgia, serif", minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <main style={{ padding: "2rem", maxWidth: 720 }}>
          <p style={{ fontFamily: "monospace", letterSpacing: ".14em", fontSize: 12, opacity: 0.6 }}>500 · INTERRUPTED</p>
          <h1 style={{ fontSize: "clamp(2.5rem,7vw,5rem)", fontWeight: 400, lineHeight: 1 }}>The journey was interrupted.</h1>
          <button onClick={reset} style={{ marginTop: 32, padding: "14px 22px", background: "transparent", color: "inherit", border: "1px solid currentColor", letterSpacing: ".16em", fontFamily: "monospace", textTransform: "uppercase", cursor: "pointer" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
