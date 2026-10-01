// NOIRÉ 2 — Clients & recognition (trust).
// Factual and restrained: a set of studio facts as large numerals, a client
// list, and a short recognition index linking to the full page.
import { addPropertyControls, ControlType } from "framer"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

type Fact = { value: string; label: string }
type Entry = { year: string; kind: string; title: string }

interface NoireClientsProps {
    label: string
    facts: Fact[]
    clients: string
    note: string
    entries: Entry[]
    linkLabel: string
    link: string
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'

const DEFAULT_FACTS: Fact[] = [
    { value: "2021", label: "Founded in Lisbon" },
    { value: "3–4", label: "Projects at a time" },
    { value: "6", label: "Disciplines" },
    { value: "1", label: "Founder on every project" },
]
const DEFAULT_ENTRIES: Entry[] = [
    { year: "2026", kind: "Exhibition", title: "Quiet Matter — Halde Kunsthalle" },
    { year: "2026", kind: "Talk", title: "Designing for slow looking" },
    { year: "2025", kind: "Award", title: "Independent Book Design Prize, shortlist" },
    { year: "2025", kind: "Publication", title: "Tiles that talk — Surface Quarterly" },
]

function useWidth(ref: React.RefObject<HTMLElement>) {
    const [w, setW] = useState(1440)
    useEffect(() => {
        if (!ref.current || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver((e) => startTransition(() => setW(e[0].contentRect.width)))
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
export default function NoireClients(props: NoireClientsProps) {
    const {
        label = "Clients & recognition",
        facts = DEFAULT_FACTS,
        clients = "Halde Kunsthalle, Baía Baths, Ferro Editions, Atelier Ombra, Kiln Room, Marrow Architects, Sobremesa, Northlight Theatre, Casa Vela, Museum of Small Things",
        note = "Clients, awards and figures are fictional demo content.",
        entries = DEFAULT_ENTRIES,
        linkLabel = "Recognition",
        link = "/recognition",
        style,
    } = props
    const root = useRef<HTMLDivElement>(null)
    const w = useWidth(root)
    const compact = w < 900
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const names = clients.split(",").map((s) => s.trim()).filter(Boolean)
    const line = "#D3CFC6"

    return (
        <section ref={root} aria-labelledby="noire-trust" style={{ ...style, width: "100%", background: "#EAE6DE", color: "#11110F", padding: `${compact ? 96 : 160}px ${pad}px` }}>
            <p id="noire-trust" style={{ margin: "0 0 48px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6D6A64", display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden="true" style={{ width: 28, height: 1, background: "#D9573F" }} />
                {label}
            </p>
            <dl style={{ display: "grid", gridTemplateColumns: `repeat(${compact ? 2 : facts.length}, minmax(0,1fr))`, gap: 0, margin: 0, borderTop: `1px solid ${line}` }}>
                {facts.map((f, i) => (
                    <div key={i} style={{ padding: compact ? "24px 16px 24px 0" : "32px 24px 32px 0", borderBottom: `1px solid ${line}`, borderRight: !compact && i < facts.length - 1 ? `1px solid ${line}` : undefined, paddingLeft: !compact && i > 0 ? 24 : 0 }}>
                        <dd style={{ margin: 0, fontFamily: SERIF, fontSize: compact ? 56 : 96, lineHeight: 1, letterSpacing: "-0.03em" }}>{f.value}</dd>
                        <dt style={{ marginTop: 10, fontFamily: SANS, fontSize: 14, color: "#6D6A64" }}>{f.label}</dt>
                    </div>
                ))}
            </dl>
            <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "minmax(0,1.4fr) minmax(0,1fr)", gap: compact ? 48 : 96, marginTop: compact ? 48 : 80 }}>
                <div>
                    <ul role="list" style={{ display: "flex", flexWrap: "wrap", gap: "0 0.45em", listStyle: "none", margin: 0, padding: 0, fontFamily: SERIF, fontSize: compact ? 30 : 44, lineHeight: 1.2, letterSpacing: "-0.015em" }}>
                        {names.map((n, i) => (
                            <li key={n}>
                                {n}
                                {i < names.length - 1 ? <span style={{ color: "#A9A49A" }}>,</span> : null}
                            </li>
                        ))}
                    </ul>
                    <p style={{ margin: "20px 0 0", fontFamily: SANS, fontSize: 13, color: "#6D6A64" }}>{note}</p>
                </div>
                <div>
                    <ul role="list" style={{ listStyle: "none", margin: 0, padding: 0, borderTop: `1px solid ${line}` }}>
                        {entries.map((e, i) => (
                            <li key={i} style={{ display: "grid", gridTemplateColumns: "56px 96px minmax(0,1fr)", gap: 12, padding: "16px 0", borderBottom: `1px solid ${line}`, fontFamily: SANS, fontSize: 14 }}>
                                <span style={{ color: "#6D6A64" }}>{e.year}</span>
                                <span style={{ color: "#6D6A64" }}>{e.kind}</span>
                                <span>{e.title}</span>
                            </li>
                        ))}
                    </ul>
                    <a href={link} style={{ display: "inline-block", marginTop: 24, padding: "10px 0 6px", borderBottom: "1px solid #11110F", color: "#11110F", textDecoration: "none", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {linkLabel} →
                    </a>
                </div>
            </div>
        </section>
    )
}

addPropertyControls(NoireClients, {
    label: { type: ControlType.String, title: "Label", defaultValue: "Clients & recognition" },
    facts: {
        type: ControlType.Array,
        title: "Facts",
        maxCount: 4,
        control: { type: ControlType.Object, controls: { value: { type: ControlType.String, title: "Value" }, label: { type: ControlType.String, title: "Label" } } },
        defaultValue: DEFAULT_FACTS,
    },
    clients: { type: ControlType.String, title: "Clients (comma separated)", displayTextArea: true, defaultValue: "Halde Kunsthalle, Baía Baths, Ferro Editions, Atelier Ombra, Kiln Room, Marrow Architects, Sobremesa, Northlight Theatre, Casa Vela, Museum of Small Things" },
    note: { type: ControlType.String, title: "Note", defaultValue: "Clients, awards and figures are fictional demo content." },
    entries: {
        type: ControlType.Array,
        title: "Recognition",
        control: { type: ControlType.Object, controls: { year: { type: ControlType.String, title: "Year" }, kind: { type: ControlType.String, title: "Kind" }, title: { type: ControlType.String, title: "Title" } } },
        defaultValue: DEFAULT_ENTRIES,
    },
    linkLabel: { type: ControlType.String, title: "Link label", defaultValue: "Recognition" },
    link: { type: ControlType.Link, title: "Link", defaultValue: "/recognition" },
})
