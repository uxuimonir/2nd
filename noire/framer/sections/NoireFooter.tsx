// NOIRÉ 2 — Footer / Colophon.
// Navigation, socials, legal and a production note, closed by a brand
// wordmark sized to fill the full width at every breakpoint.
import { addPropertyControls, ControlType } from "framer"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

type L = { label: string; link: string }

interface NoireFooterProps {
    wordmark: string
    descriptor: string
    email: string
    pages: L[]
    studio: L[]
    social: L[]
    legal: L[]
    note: string
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'

const PAGES: L[] = [
    { label: "Home", link: "/" },
    { label: "Work", link: "/work" },
    { label: "About", link: "/about" },
    { label: "Services", link: "/services" },
    { label: "Journal", link: "/journal" },
    { label: "Contact", link: "/contact" },
]
const STUDIO: L[] = [
    { label: "Studio Archive", link: "/studio" },
    { label: "Recognition", link: "/recognition" },
    { label: "Colophon", link: "/colophon" },
]
const SOCIAL: L[] = [
    { label: "Instagram", link: "https://www.instagram.com/" },
    { label: "Are.na", link: "https://www.are.na/" },
    { label: "LinkedIn", link: "https://www.linkedin.com/" },
]
const LEGAL: L[] = [
    { label: "Privacy", link: "/privacy" },
    { label: "Terms", link: "/terms" },
]

function useWidth(ref: React.RefObject<HTMLElement | null>) {
    const [w, setW] = useState(1440)
    useEffect(() => {
        if (!ref.current || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver((e) => startTransition(() => setW((e[0].target as HTMLElement).getBoundingClientRect().width)))
        ro.observe(ref.current)
        return () => ro.disconnect()
    }, [])
    return w
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function NoireFooter(props: NoireFooterProps) {
    const { wordmark = "NOIRÉ", descriptor = "Independent studio for art direction, identity and spatial design. Lisbon, working everywhere.", email = "hello@noire.example", pages = PAGES, studio = STUDIO, social = SOCIAL, legal = LEGAL, note = "© 2026 Noiré Studio (demo). Built with the NOIRÉ 2 system.", style } = props
    const root = useRef<HTMLDivElement>(null)
    const w = useWidth(root)
    const compact = w < 900
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const inner = w - pad * 2
    const measure = useRef<HTMLSpanElement>(null)
    const [ratio, setRatio] = useState(0.62 * Math.max(1, wordmark.length))
    useEffect(() => {
        const m = () => {
            if (measure.current) startTransition(() => setRatio(measure.current!.getBoundingClientRect().width / 100))
        }
        m()
        if (typeof document !== "undefined" && (document as any).fonts?.ready) (document as any).fonts.ready.then(m)
    }, [wordmark])
    const wordSize = Math.max(64, (inner / Math.max(0.1, ratio)) * 0.995)

    const col = (title: string, items: L[], external = false) => (
        <nav aria-label={title}>
            <p style={{ margin: "0 0 16px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#A5A199" }}>{title}</p>
            <ul role="list" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
                {items.map((l) => (
                    <li key={l.label}>
                        <a href={l.link} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} style={{ display: "inline-block", padding: "4px 0", fontFamily: SANS, fontSize: 16, color: "#F7F5F0", textDecoration: "none" }}>
                            {l.label}
                            {external ? <span aria-hidden="true"> ↗</span> : null}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )

    return (
        <footer ref={root} style={{ ...style, position: "relative", width: "100%", background: "#11110F", color: "#F7F5F0", padding: `${compact ? 72 : 112}px ${pad}px 28px`, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr 1fr" : "minmax(0,2fr) repeat(3, minmax(0,1fr))", gap: compact ? "48px 24px" : 48 }}>
                <div style={{ gridColumn: compact ? "1 / -1" : undefined }}>
                    <p style={{ margin: 0, maxWidth: 420, fontFamily: SANS, fontSize: 19, lineHeight: 1.5, color: "#A5A199" }}>{descriptor}</p>
                    <a href={`mailto:${email}`} style={{ display: "inline-block", marginTop: 24, fontFamily: SERIF, fontSize: 32, color: "#F7F5F0", textDecoration: "none", borderBottom: "1px solid #3a3833" }}>
                        {email}
                    </a>
                </div>
                {col("Pages", pages)}
                {col("Studio", studio)}
                {col("Elsewhere", social, true)}
            </div>
            <span ref={measure} aria-hidden="true" style={{ position: "absolute", visibility: "hidden", whiteSpace: "nowrap", fontFamily: SERIF, fontSize: 100, letterSpacing: "-0.04em" }}>
                {wordmark}
            </span>
            <a href="/" aria-label={`${wordmark} — back to home`} style={{ display: "block", marginTop: compact ? 64 : 96, fontFamily: SERIF, fontSize: wordSize, lineHeight: 0.8, letterSpacing: "-0.04em", color: "#F7F5F0", textDecoration: "none", whiteSpace: "nowrap", paddingBottom: "0.06em" }}>
                {wordmark}
            </a>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, marginTop: 24, paddingTop: 20, borderTop: "1px solid #2a2925", fontFamily: SANS, fontSize: 13, color: "#A5A199" }}>
                <span>{note}</span>
                <span style={{ display: "flex", gap: 24 }}>
                    {legal.map((l) => (
                        <a key={l.label} href={l.link} style={{ color: "#A5A199", textDecoration: "none" }}>
                            {l.label}
                        </a>
                    ))}
                </span>
            </div>
        </footer>
    )
}

const linkList = (title: string, def: L[]) => ({
    type: ControlType.Array,
    title,
    control: { type: ControlType.Object, controls: { label: { type: ControlType.String, title: "Label" }, link: { type: ControlType.Link, title: "Link" } } },
    defaultValue: def,
})

addPropertyControls(NoireFooter, {
    wordmark: { type: ControlType.String, title: "Wordmark", defaultValue: "NOIRÉ" },
    descriptor: { type: ControlType.String, title: "Descriptor", displayTextArea: true, defaultValue: "Independent studio for art direction, identity and spatial design. Lisbon, working everywhere." },
    email: { type: ControlType.String, title: "Email", defaultValue: "hello@noire.example" },
    pages: linkList("Pages", PAGES) as any,
    studio: linkList("Studio", STUDIO) as any,
    social: linkList("Social", SOCIAL) as any,
    legal: linkList("Legal", LEGAL) as any,
    note: { type: ControlType.String, title: "Note", defaultValue: "© 2026 Noiré Studio (demo). Built with the NOIRÉ 2 system." },
})
