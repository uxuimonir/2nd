// NOIRÉ 2 — Featured work (sticky stack).
// The template's one memorable interaction: selected projects arrive as large
// cards that pin and stack while scrolling; the card underneath settles back
// (scale 1 → 0.94, dimming) so the newest project always reads first. Every
// card is a real link to its case study. Narrow screens and reduced motion get
// a plain vertical list with the same content.
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

type Project = { title: string; client: string; discipline: string; year: string; thesis: string; link: string; image?: { src: string; alt?: string }; tone: string }

interface NoireStackedWorkProps {
    label: string
    heading: string
    headingItalic: string
    allLabel: string
    allLink: string
    projects: Project[]
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'
const IMG = "https://raw.githubusercontent.com/uxuimonir/2nd/dfc52ae6763df67bd2e5dc8f8b76bac7d8ec60f1/noire/public/media/"

const DEFAULT_PROJECTS: Project[] = [
    { title: "Quiet Matter", client: "Halde Kunsthalle", discipline: "Exhibition identity & catalogue", year: "2026", thesis: "An exhibition about weight, told almost entirely through restraint.", link: "/work/quiet-matter", image: { src: IMG + "p-quiet-matter-hero.webp" }, tone: "#2B2722" },
    { title: "Tidewater", client: "Baía Baths", discipline: "Spatial identity & signage", year: "2025", thesis: "A bathhouse identity that lets the water and the tile do the talking.", link: "/work/tidewater", image: { src: IMG + "p-tidewater-hero.webp" }, tone: "#173A33" },
    { title: "Ninefold", client: "Ferro Editions", discipline: "Book design", year: "2025", thesis: "Nine essays, nine folds — a book whose structure is its argument.", link: "/work/ninefold", image: { src: IMG + "p-ninefold-hero.webp" }, tone: "#3A322A" },
    { title: "Lowlight", client: "Atelier Ombra", discipline: "Art direction & campaign", year: "2024", thesis: "Photographing lamps by the light they give, not the way they look.", link: "/work/lowlight", image: { src: IMG + "p-lowlight-hero.webp" }, tone: "#15130F" },
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

function Card({ p, i, total, progress, sticky, compact }: { p: Project; i: number; total: number; progress: MotionValue<number>; sticky: boolean; compact: boolean }) {
    const start = i / total
    const end = (i + 1) / total
    const scale = useTransform(progress, [start, end, 1], sticky && i < total - 1 ? [1, 0.94, 0.94] : [1, 1, 1])
    const dim = useTransform(progress, [start, end], sticky && i < total - 1 ? [0, 0.45] : [0, 0])
    const imgScale = useTransform(progress, [Math.max(0, start - 1 / total), end], sticky ? [1.12, 1] : [1, 1])
    const [hover, setHover] = useState(false)

    return (
        <div style={sticky ? { position: "sticky", top: 96 + i * 18, height: "calc(100svh - 140px)", minHeight: 560, maxHeight: 860, paddingBottom: 24 } : { marginBottom: 20 }}>
            <motion.a
                href={p.link}
                onPointerEnter={() => setHover(true)}
                onPointerLeave={() => setHover(false)}
                style={{ scale, transformOrigin: "50% 0%", display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative", height: sticky ? "100%" : compact ? 520 : 640, borderRadius: compact ? 14 : 22, overflow: "hidden", background: p.tone, color: "#F7F5F0", textDecoration: "none", boxShadow: "0 -20px 60px rgba(17,17,15,0.18)" }}
            >
                <motion.img src={p.image?.src} alt={p.image?.alt ?? ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", scale: imgScale }} animate={{ scale: hover ? 1.03 : undefined }} />
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(17,17,15,0) 35%, rgba(17,17,15,0.82) 100%)" }} />
                <motion.div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "#11110F", opacity: dim }} />
                <div style={{ position: "relative", display: "grid", gridTemplateColumns: compact ? "1fr" : "minmax(0,1.4fr) minmax(0,1fr)", gap: compact ? 12 : 32, alignItems: "end", padding: compact ? 20 : 40 }}>
                    <div>
                        <p style={{ margin: "0 0 12px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(247,245,240,0.72)" }}>
                            {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} — {p.discipline}
                        </p>
                        <h3 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: compact ? 48 : 96, lineHeight: 0.95, letterSpacing: "-0.03em" }}>{p.title}</h3>
                    </div>
                    <div style={{ display: "grid", gap: 16, justifyItems: compact ? "start" : "end", textAlign: compact ? "left" : "right" }}>
                        <p style={{ margin: 0, maxWidth: 380, fontFamily: SANS, fontSize: 16, lineHeight: 1.5, color: "rgba(247,245,240,0.82)" }}>{p.thesis}</p>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 12, fontFamily: SANS, fontSize: 13, color: "rgba(247,245,240,0.72)" }}>
                            {p.client} · {p.year}
                            <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 99, background: hover ? "#D9573F" : "rgba(247,245,240,0.14)", color: "#F7F5F0", transition: "background 220ms ease-out", backdropFilter: "blur(6px)" }}>
                                ↗
                            </span>
                        </span>
                    </div>
                </div>
            </motion.a>
        </div>
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function NoireStackedWork(props: NoireStackedWorkProps) {
    const { label = "Selected work", heading = "Four projects,", headingItalic = "one way of working.", allLabel = "All projects", allLink = "/work", projects = DEFAULT_PROJECTS, style } = props
    const root = useRef<HTMLDivElement>(null)
    const stack = useRef<HTMLDivElement>(null)
    const w = useWidth(root)
    const isStatic = useIsStaticRenderer()
    const reduce = useReducedMotion() || isStatic
    const compact = w < 900
    const sticky = !compact && !reduce
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const { scrollYProgress } = useScroll({ target: stack, offset: ["start start", "end end"] })

    return (
        <section ref={root} aria-labelledby="noire-featured" style={{ ...style, position: "relative", width: "100%", background: "#F5F2EC", color: "#11110F", padding: `${compact ? 96 : 160}px ${pad}px ${compact ? 64 : 120}px` }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: compact ? 40 : 64 }}>
                <div>
                    <p style={{ margin: "0 0 20px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6D6A64", display: "flex", alignItems: "center", gap: 10 }}>
                        <span aria-hidden="true" style={{ width: 28, height: 1, background: "#D9573F" }} />
                        {label}
                    </p>
                    <h2 id="noire-featured" style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: compact ? 48 : 88, lineHeight: 0.98, letterSpacing: "-0.03em" }}>
                        {heading} <em style={{ color: "#D9573F" }}>{headingItalic}</em>
                    </h2>
                </div>
                <a href={allLink} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 0 6px", borderBottom: "1px solid #11110F", color: "#11110F", textDecoration: "none", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {allLabel} <span aria-hidden="true">→</span>
                </a>
            </div>
            <div ref={stack} style={{ position: "relative" }}>
                {projects.map((p, i) => (
                    <Card key={p.title + i} p={p} i={i} total={projects.length} progress={scrollYProgress} sticky={sticky} compact={compact} />
                ))}
            </div>
        </section>
    )
}

addPropertyControls(NoireStackedWork, {
    label: { type: ControlType.String, title: "Label", defaultValue: "Selected work" },
    heading: { type: ControlType.String, title: "Heading", defaultValue: "Four projects," },
    headingItalic: { type: ControlType.String, title: "Heading italic", defaultValue: "one way of working." },
    allLabel: { type: ControlType.String, title: "All label", defaultValue: "All projects" },
    allLink: { type: ControlType.Link, title: "All link", defaultValue: "/work" },
    projects: {
        type: ControlType.Array,
        title: "Projects",
        maxCount: 6,
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title" },
                client: { type: ControlType.String, title: "Client" },
                discipline: { type: ControlType.String, title: "Discipline" },
                year: { type: ControlType.String, title: "Year" },
                thesis: { type: ControlType.String, title: "Thesis", displayTextArea: true },
                link: { type: ControlType.Link, title: "Link" },
                image: { type: ControlType.ResponsiveImage, title: "Image" },
                tone: { type: ControlType.Color, title: "Card tone" },
            },
        },
        defaultValue: DEFAULT_PROJECTS,
    },
})
