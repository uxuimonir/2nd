// NOIRÉ 2 — Project detail (case study).
// Title/meta → full-bleed hero with a scroll-linked crop → statement →
// visual sequence with changing scale and rhythm → details & outcome →
// next project. One instance per project page; every field is editable.
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

type Img = { src: string; alt?: string }
type Shot = { image?: Img; caption: string; layout: "full" | "wide" | "inset" | "pair" }

interface NoireProjectDetailProps {
    title: string
    thesis: string
    category: string
    client: string
    year: string
    discipline: string
    location: string
    hero?: Img
    statement: string
    body: string
    gallery: Shot[]
    role: string
    deliverables: string
    team: string
    credits: string
    outcome: string
    externalLabel: string
    externalUrl: string
    nextTitle: string
    nextLink: string
    nextImage?: Img
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'
const EASE = [0.16, 1, 0.3, 1] as const
const IMG = "https://raw.githubusercontent.com/uxuimonir/2nd/83430dfd2a7c2050799516849c47d8f2be688dc7/noire/public/media/"

const DEFAULT_GALLERY: Shot[] = [
    { image: { src: IMG + "p-quiet-matter-01.webp" }, caption: "Main hall, plinth heights set to the reading line.", layout: "full" },
    { image: { src: IMG + "p-quiet-matter-02.webp" }, caption: "Pair of forms, catalogue plate 12.", layout: "pair" },
    { image: { src: IMG + "p-quiet-matter-06.webp" }, caption: "A single form in raking light.", layout: "pair" },
    { image: { src: IMG + "p-quiet-matter-04.webp" }, caption: "Room four: works on paper hung at 1.1 m.", layout: "wide" },
    { image: { src: IMG + "p-quiet-matter-03.webp" }, caption: "Surface study used for the cover.", layout: "inset" },
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

function Reveal({ children, reduce, style }: { children: React.ReactNode; reduce: boolean; style?: CSSProperties }) {
    return (
        <motion.div style={style} initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10% 0px" }} transition={{ duration: 0.9, ease: EASE }}>
            {children}
        </motion.div>
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function NoireProjectDetail(props: NoireProjectDetailProps) {
    const {
        title = "Quiet Matter",
        thesis = "An exhibition about weight, told almost entirely through restraint.",
        category = "Exhibition",
        client = "Halde Kunsthalle",
        year = "2026",
        discipline = "Exhibition identity & catalogue",
        location = "Bergen",
        hero = { src: IMG + "p-quiet-matter-hero.webp", alt: "A smooth pale stone sculpture on a low plinth in a warm grey gallery." },
        statement = "Identity, wayfinding and catalogue for a survey of post-war stone sculpture.",
        body = "Quiet Matter gathered forty sculptures made between 1948 and 1979, most of them carved rather than cast. The curators wanted visitors to slow down before they read anything — to register mass, grain and shadow first.\n\nWe built the identity around that delay. Wall texts sit low and small, set in a single weight. Titles are placed at the height of a plinth rather than at eye level, so reading happens in the same posture as looking.",
        gallery = DEFAULT_GALLERY,
        role = "Identity, exhibition graphics, catalogue design",
        deliverables = "Visual identity, Wayfinding & wall texts, Exhibition catalogue (224 pp.), Poster series",
        team = "Mira Solberg, Jonas Erde, Lea Okafor",
        credits = "Curation — Halde Kunsthalle (fictional); Exhibition architecture — Studio Vetle; Printing — Grå Trykk",
        outcome = "Visitors stayed an average of 74 minutes — the longest dwell time recorded for a survey show at the venue (demo figure).",
        externalLabel = "",
        externalUrl = "",
        nextTitle = "Tidewater",
        nextLink = "/work/tidewater",
        nextImage = { src: IMG + "p-tidewater-hero.webp" },
        style,
    } = props
    const root = useRef<HTMLDivElement>(null)
    const heroRef = useRef<HTMLDivElement>(null)
    const w = useWidth(root)
    const isStatic = useIsStaticRenderer()
    const reduce = Boolean(useReducedMotion() || isStatic)
    const compact = w < 900
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start end", "end start"] })
    const heroY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"])
    const muted = "#6D6A64"
    const line = "#D3CFC6"

    const meta: [string, string][] = [
        ["Client", client],
        ["Year", year],
        ["Discipline", discipline],
        ["Location", location],
    ]
    const details: [string, string][] = [
        ["Role", role],
        ["Scope", deliverables.split(",").map((s) => s.trim()).join("\n")],
        ["Team", team],
        ["Credits", credits.split(";").map((s) => s.trim()).join("\n")],
    ]

    const shot = (s: Shot, i: number) => {
        const ratio = s.layout === "full" ? "16 / 9" : s.layout === "wide" ? "3 / 2" : s.layout === "inset" ? "1 / 1" : "4 / 5"
        return (
            <Reveal reduce={reduce}>
                <figure style={{ margin: 0 }}>
                    <div style={{ aspectRatio: ratio, borderRadius: s.layout === "full" ? 0 : 18, overflow: "hidden", background: "#EAE6DE" }}>
                        <img src={s.image?.src} alt={s.image?.alt ?? s.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <figcaption style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 14, padding: s.layout === "full" ? `0 ${pad}px` : 0, fontFamily: SANS, fontSize: 13, color: muted }}>
                        <span>{s.caption}</span>
                        <span>
                            {String(i + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
                        </span>
                    </figcaption>
                </figure>
            </Reveal>
        )
    }

    // Lay the sequence out in rows: full/wide/inset alone, consecutive pairs side by side.
    const rows: Shot[][] = []
    gallery.forEach((s) => {
        const last = rows[rows.length - 1]
        if (s.layout === "pair" && last && last.length === 1 && last[0].layout === "pair") last.push(s)
        else rows.push([s])
    })
    let counter = -1

    return (
        <article ref={root} style={{ ...style, width: "100%", background: "#F5F2EC", color: "#11110F" }}>
            <header style={{ padding: `${compact ? 130 : 180}px ${pad}px ${compact ? 40 : 64}px` }}>
                <nav aria-label="Breadcrumb" style={{ display: "flex", gap: 10, marginBottom: 28, fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: muted }}>
                    <a href="/work" style={{ color: muted, textDecoration: "none" }}>Work</a>
                    <span aria-hidden="true">/</span>
                    <a href={`/work?category=${encodeURIComponent(category)}`} style={{ color: muted, textDecoration: "none" }}>{category}</a>
                </nav>
                <h1 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: compact ? 64 : Math.min(176, w * 0.12), lineHeight: 0.9, letterSpacing: "-0.04em" }}>
                    <span style={{ display: "block", overflow: "hidden", paddingBottom: "0.08em" }}>
                        <motion.span style={{ display: "block" }} initial={reduce ? false : { y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 1.1, ease: EASE }}>
                            {title}
                        </motion.span>
                    </span>
                </h1>
                <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "minmax(0,1.2fr) minmax(0,2fr)", gap: compact ? 28 : 64, marginTop: compact ? 24 : 40, alignItems: "end" }}>
                    <p style={{ margin: 0, maxWidth: 480, fontFamily: SANS, fontSize: compact ? 18 : 21, lineHeight: 1.5, color: muted }}>{thesis}</p>
                    <dl style={{ display: "grid", gridTemplateColumns: compact ? "1fr 1fr" : "repeat(4, minmax(0,1fr))", gap: 16, margin: 0, paddingTop: 16, borderTop: `1px solid ${line}` }}>
                        {meta.map(([k, v]) => (
                            <div key={k}>
                                <dt style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: muted }}>{k}</dt>
                                <dd style={{ margin: "6px 0 0", fontFamily: SANS, fontSize: 15 }}>{v}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </header>

            <div ref={heroRef} style={{ position: "relative", height: compact ? "62vw" : "min(86vh, 900px)", minHeight: 320, overflow: "hidden", margin: compact ? 0 : `0 ${pad}px`, borderRadius: compact ? 0 : 22, background: "#EAE6DE" }}>
                <motion.img src={hero?.src} alt={hero?.alt ?? ""} style={{ position: "absolute", left: 0, width: "100%", height: "116%", top: "-8%", objectFit: "cover", y: heroY }} />
            </div>

            <section aria-label="Statement" style={{ padding: `${compact ? 80 : 160}px ${pad}px` }}>
                <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "minmax(0,1fr) minmax(0,2fr)", gap: compact ? 24 : 64 }}>
                    <p style={{ margin: 0, fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: muted, display: "flex", alignItems: "center", gap: 10, alignSelf: "start" }}>
                        <span aria-hidden="true" style={{ width: 28, height: 1, background: "#D9573F" }} />
                        Statement
                    </p>
                    <div>
                        <Reveal reduce={reduce}>
                            <p style={{ margin: 0, fontFamily: SERIF, fontSize: compact ? 34 : 56, lineHeight: 1.1, letterSpacing: "-0.02em" }}>{statement}</p>
                        </Reveal>
                        <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "1fr 1fr", gap: 28, marginTop: 40 }}>
                            {body.split(/\n\s*\n/).map((para, i) => (
                                <p key={i} style={{ margin: 0, fontFamily: SANS, fontSize: 17, lineHeight: 1.65, color: muted }}>{para}</p>
                            ))}
                        </div>
                        {externalUrl ? (
                            <a href={externalUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 32, height: 48, padding: "0 22px", borderRadius: 99, border: "1px solid #11110F", color: "#11110F", textDecoration: "none", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                {externalLabel || "Visit the live project"} ↗<span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}> (opens in a new tab)</span>
                            </a>
                        ) : null}
                    </div>
                </div>
            </section>

            <section aria-label="Visual sequence" style={{ display: "grid", gap: compact ? 56 : 120, paddingBottom: compact ? 80 : 160 }}>
                {rows.map((row, r) => {
                    const first = row[0]
                    if (row.length === 2) {
                        const a = ++counter
                        const b = ++counter
                        return (
                            <div key={r} style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "minmax(0,1fr) minmax(0,0.8fr)", gap: compact ? 56 : 24, padding: `0 ${pad}px`, alignItems: "end" }}>
                                {shot(row[0], a)}
                                <div style={{ marginBottom: compact ? 0 : 160 }}>{shot(row[1], b)}</div>
                            </div>
                        )
                    }
                    const idx = ++counter
                    const inner = first.layout === "full" ? { padding: 0 } : first.layout === "wide" ? { padding: `0 ${compact ? pad : pad + w * 0.06}px` } : { padding: `0 ${pad}px`, width: compact ? "100%" : "52%", marginLeft: compact ? 0 : "18%" }
                    return (
                        <div key={r} style={inner as CSSProperties}>
                            {shot(first, idx)}
                        </div>
                    )
                })}
            </section>

            <section aria-label="Details" style={{ padding: `0 ${pad}px ${compact ? 80 : 160}px` }}>
                <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "minmax(0,1fr) minmax(0,1.3fr) minmax(0,1fr)", gap: compact ? 32 : 64, alignItems: "start" }}>
                    <p style={{ margin: 0, fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: muted, display: "flex", alignItems: "center", gap: 10 }}>
                        <span aria-hidden="true" style={{ width: 28, height: 1, background: "#D9573F" }} />
                        Details
                    </p>
                    <dl style={{ margin: 0, borderTop: `1px solid ${line}` }}>
                        {details.map(([k, v]) => (
                            <div key={k} style={{ display: "grid", gridTemplateColumns: "110px minmax(0,1fr)", gap: 16, padding: "16px 0", borderBottom: `1px solid ${line}` }}>
                                <dt style={{ fontFamily: SANS, fontSize: 14, color: muted }}>{k}</dt>
                                <dd style={{ margin: 0, fontFamily: SANS, fontSize: 15, lineHeight: 1.55, whiteSpace: "pre-line" }}>{v}</dd>
                            </div>
                        ))}
                    </dl>
                    {outcome ? (
                        <aside aria-label="Outcome" style={{ padding: 28, borderRadius: 18, background: "#11110F", color: "#F7F5F0" }}>
                            <p style={{ margin: 0, fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#E8735C" }}>Outcome</p>
                            <p style={{ margin: "14px 0 0", fontFamily: SERIF, fontSize: 28, lineHeight: 1.2 }}>{outcome}</p>
                        </aside>
                    ) : null}
                </div>
            </section>

            <a href={nextLink} style={{ display: "block", position: "relative", overflow: "hidden", background: "#11110F", color: "#F7F5F0", textDecoration: "none" }}>
                {nextImage?.src ? <img src={nextImage.src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }} /> : null}
                <div style={{ position: "relative", padding: `${compact ? 80 : 140}px ${pad}px`, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
                    <div>
                        <p style={{ margin: "0 0 16px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#E8735C" }}>Next project</p>
                        <p style={{ margin: 0, fontFamily: SERIF, fontSize: compact ? 64 : 140, lineHeight: 0.9, letterSpacing: "-0.04em" }}>{nextTitle}</p>
                    </div>
                    <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: compact ? 64 : 96, height: compact ? 64 : 96, borderRadius: 99, background: "#D9573F", color: "#11110F", fontSize: compact ? 24 : 32 }}>
                        →
                    </span>
                </div>
            </a>
        </article>
    )
}

const img = { type: ControlType.ResponsiveImage } as const

addPropertyControls(NoireProjectDetail, {
    title: { type: ControlType.String, title: "Title", defaultValue: "Quiet Matter" },
    thesis: { type: ControlType.String, title: "Thesis", displayTextArea: true },
    category: { type: ControlType.String, title: "Category", defaultValue: "Exhibition" },
    client: { type: ControlType.String, title: "Client", defaultValue: "Halde Kunsthalle" },
    year: { type: ControlType.String, title: "Year", defaultValue: "2026" },
    discipline: { type: ControlType.String, title: "Discipline", defaultValue: "Exhibition identity & catalogue" },
    location: { type: ControlType.String, title: "Location", defaultValue: "Bergen" },
    hero: { ...img, title: "Hero image" },
    statement: { type: ControlType.String, title: "Statement", displayTextArea: true },
    body: { type: ControlType.String, title: "Body (blank line = new paragraph)", displayTextArea: true },
    gallery: {
        type: ControlType.Array,
        title: "Visual sequence",
        control: {
            type: ControlType.Object,
            controls: {
                image: { ...img, title: "Image" },
                caption: { type: ControlType.String, title: "Caption" },
                layout: { type: ControlType.Enum, title: "Layout", options: ["full", "wide", "inset", "pair"], optionTitles: ["Full bleed", "Wide", "Inset", "Pair"] },
            },
        },
        defaultValue: DEFAULT_GALLERY,
    },
    role: { type: ControlType.String, title: "Role" },
    deliverables: { type: ControlType.String, title: "Scope (comma separated)", displayTextArea: true },
    team: { type: ControlType.String, title: "Team" },
    credits: { type: ControlType.String, title: "Credits (semicolon separated)", displayTextArea: true },
    outcome: { type: ControlType.String, title: "Outcome", displayTextArea: true },
    externalLabel: { type: ControlType.String, title: "External label", defaultValue: "" },
    externalUrl: { type: ControlType.String, title: "External URL (real only)", defaultValue: "" },
    nextTitle: { type: ControlType.String, title: "Next title", defaultValue: "Tidewater" },
    nextLink: { type: ControlType.Link, title: "Next link", defaultValue: "/work/tidewater" },
    nextImage: { ...img, title: "Next image" },
})
