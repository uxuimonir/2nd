// NOIRÉ 2 — Work archive.
// Grid and Index views with category filters. The filter and view live in the
// URL (?category=&view=) so links are shareable and Back restores the state.
// Every card links to a real project page; no hover-only information.
import { addPropertyControls, ControlType } from "framer"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

type Project = { title: string; client: string; discipline: string; category: string; year: string; link: string; image?: { src: string; alt?: string } }

interface NoireWorkArchiveProps {
    projects: Project[]
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'
const EASE = [0.22, 0.61, 0.36, 1] as const
const IMG = "https://raw.githubusercontent.com/uxuimonir/2nd/83430dfd2a7c2050799516849c47d8f2be688dc7/noire/public/media/"

const DEFAULT_PROJECTS: Project[] = [
    { title: "Quiet Matter", client: "Halde Kunsthalle", discipline: "Exhibition identity & catalogue", category: "Exhibition", year: "2026", link: "/work/quiet-matter", image: { src: IMG + "p-quiet-matter-hero.webp" } },
    { title: "Tidewater", client: "Baía Baths", discipline: "Spatial identity & signage", category: "Spatial", year: "2025", link: "/work/tidewater", image: { src: IMG + "p-tidewater-hero.webp" } },
    { title: "Ninefold", client: "Ferro Editions", discipline: "Book design", category: "Editorial", year: "2025", link: "/work/ninefold", image: { src: IMG + "p-ninefold-hero.webp" } },
    { title: "Lowlight", client: "Atelier Ombra", discipline: "Art direction & campaign", category: "Art Direction", year: "2024", link: "/work/lowlight", image: { src: IMG + "p-lowlight-hero.webp" } },
    { title: "Field Notes on Clay", client: "Kiln Room", discipline: "Brand identity", category: "Identity", year: "2024", link: "/work/field-notes-on-clay", image: { src: IMG + "p-field-notes-on-clay-hero.webp" } },
    { title: "Index of Rooms", client: "Marrow Architects", discipline: "Digital archive & website", category: "Digital", year: "2023", link: "/work/index-of-rooms", image: { src: IMG + "p-index-of-rooms-hero.webp" } },
    { title: "The Long Table", client: "Sobremesa", discipline: "Restaurant identity", category: "Identity", year: "2023", link: "/work/the-long-table", image: { src: IMG + "p-the-long-table-hero.webp" } },
    { title: "Paper Weather", client: "Self-initiated", discipline: "Print series", category: "Editorial", year: "2022", link: "/work/paper-weather", image: { src: IMG + "p-paper-weather-hero.webp" } },
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

function Card({ p, ratio, big }: { p: Project; ratio: string; big: boolean }) {
    const [hover, setHover] = useState(false)
    return (
        <a href={p.link} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)} style={{ display: "block", color: "#11110F", textDecoration: "none" }}>
            <div style={{ position: "relative", aspectRatio: ratio, borderRadius: 18, overflow: "hidden", background: "#EAE6DE" }}>
                <img src={p.image?.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transform: hover ? "scale(1.04)" : "scale(1)", transition: "transform 600ms cubic-bezier(.22,.61,.36,1)" }} />
                <span style={{ position: "absolute", top: 16, left: 16, padding: "6px 12px", borderRadius: 99, background: "rgba(245,242,236,0.9)", backdropFilter: "blur(8px)", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.04em" }}>{p.category}</span>
                <span aria-hidden="true" style={{ position: "absolute", right: 16, bottom: 16, display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: 99, background: hover ? "#D9573F" : "#F5F2EC", color: "#11110F", transform: hover ? "rotate(0deg)" : "rotate(-45deg)", transition: "transform 420ms cubic-bezier(.16,1,.3,1), background 220ms ease-out" }}>
                    →
                </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, marginTop: 18 }}>
                <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: big ? 44 : 32, lineHeight: 1.05, letterSpacing: "-0.02em" }}>{p.title}</h2>
                <span style={{ fontFamily: SANS, fontSize: 13, color: "#6D6A64" }}>{p.year}</span>
            </div>
            <p style={{ margin: "6px 0 0", fontFamily: SANS, fontSize: 14, color: "#6D6A64" }}>
                {p.client} — {p.discipline}
            </p>
        </a>
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function NoireWorkArchive(props: NoireWorkArchiveProps) {
    const { projects = DEFAULT_PROJECTS, style } = props
    const root = useRef<HTMLDivElement>(null)
    const w = useWidth(root)
    const reduce = useReducedMotion()
    const [category, setCategory] = useState<string | null>(null)
    const [view, setView] = useState<"grid" | "index">("grid")
    const compact = w < 900
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const categories = Array.from(new Set(projects.map((p) => p.category)))
    const visible = projects.filter((p) => !category || p.category === category)

    useEffect(() => {
        if (typeof window === "undefined") return
        const q = new URLSearchParams(window.location.search)
        const c = q.get("category")
        startTransition(() => {
            if (c && categories.includes(c)) setCategory(c)
            if (q.get("view") === "index") setView("index")
        })
    }, [])

    const sync = (c: string | null, v: "grid" | "index") => {
        if (typeof window === "undefined") return
        const q = new URLSearchParams()
        if (c) q.set("category", c)
        if (v === "index") q.set("view", "index")
        const s = q.toString()
        window.history.replaceState(null, "", s ? `?${s}` : window.location.pathname)
    }

    const chip = (on: boolean): CSSProperties => ({ minHeight: 40, padding: "0 16px", borderRadius: 99, border: `1px solid ${on ? "#11110F" : "#D3CFC6"}`, background: on ? "#11110F" : "transparent", color: on ? "#F5F2EC" : "#11110F", fontFamily: SANS, fontSize: 13, cursor: "pointer" })
    const ratios = compact ? ["4 / 3"] : ["4 / 3", "4 / 5", "4 / 5", "4 / 3"]

    return (
        <section ref={root} aria-label="Projects" style={{ ...style, width: "100%", background: "#F5F2EC", color: "#11110F", padding: `0 ${pad}px ${compact ? 96 : 160}px` }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "16px 0", borderTop: "1px solid #D3CFC6", borderBottom: "1px solid #D3CFC6", marginBottom: compact ? 32 : 56 }}>
                <div role="group" aria-label="Filter by category" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <button type="button" aria-pressed={!category} style={chip(!category)} onClick={() => { startTransition(() => setCategory(null)); sync(null, view) }}>
                        All <span style={{ opacity: 0.55 }}>{projects.length}</span>
                    </button>
                    {categories.map((c) => (
                        <button key={c} type="button" aria-pressed={category === c} style={chip(category === c)} onClick={() => { const n = category === c ? null : c; startTransition(() => setCategory(n)); sync(n, view) }}>
                            {c} <span style={{ opacity: 0.55 }}>{projects.filter((p) => p.category === c).length}</span>
                        </button>
                    ))}
                </div>
                <div role="group" aria-label="View" style={{ display: "inline-flex", padding: 3, border: "1px solid #D3CFC6", borderRadius: 99 }}>
                    {(["grid", "index"] as const).map((v) => (
                        <button key={v} type="button" aria-pressed={view === v} onClick={() => { startTransition(() => setView(v)); sync(category, v) }} style={{ minHeight: 34, minWidth: 72, padding: "0 14px", border: 0, borderRadius: 99, background: view === v ? "#11110F" : "transparent", color: view === v ? "#F5F2EC" : "#11110F", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}>
                            {v}
                        </button>
                    ))}
                </div>
            </div>
            <p role="status" aria-live="polite" style={{ margin: "0 0 28px", fontFamily: SANS, fontSize: 13, color: "#6D6A64" }}>
                Showing {visible.length} of {projects.length} projects{category ? ` in ${category}` : ""}
            </p>
            <AnimatePresence mode="wait">
                {view === "grid" ? (
                    <motion.ul key={"g" + category} role="list" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: compact ? (w >= 600 ? "1fr 1fr" : "1fr") : "repeat(12, minmax(0,1fr))", gap: compact ? "48px 20px" : "96px 24px" }}>
                        {visible.map((p, i) => {
                            const k = i % 4
                            const span = compact ? undefined : ["1 / span 7", "9 / span 4", "2 / span 4", "7 / span 6"][k]
                            return (
                                <li key={p.title} style={{ gridColumn: span, marginTop: !compact && k === 3 ? 120 : 0, alignSelf: !compact && k === 1 ? "end" : undefined }}>
                                    <Card p={p} ratio={ratios[k % ratios.length]} big={!compact && (k === 0 || k === 3)} />
                                </li>
                            )
                        })}
                    </motion.ul>
                ) : (
                    <motion.ul key={"i" + category} role="list" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.35 }} style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "1px solid #11110F" }}>
                        {visible.map((p) => (
                            <li key={p.title}>
                                <a href={p.link} style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0,1fr) auto" : "80px minmax(0,2.4fr) minmax(0,1.4fr) minmax(0,1.1fr) 40px", gap: compact ? "4px 16px" : 24, alignItems: "center", padding: compact ? "18px 0" : "24px 0", borderBottom: "1px solid #D3CFC6", color: "#11110F", textDecoration: "none" }}>
                                    {compact ? null : <span style={{ fontFamily: SANS, fontSize: 14, color: "#6D6A64" }}>{p.year}</span>}
                                    <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: compact ? 28 : 40, lineHeight: 1.05, letterSpacing: "-0.02em" }}>{p.title}</h2>
                                    {compact ? <span style={{ fontFamily: SANS, fontSize: 13, color: "#6D6A64" }}>{p.year}</span> : null}
                                    <span style={{ fontFamily: SANS, fontSize: 14, color: "#6D6A64" }}>{p.discipline}</span>
                                    {compact ? null : <span style={{ fontFamily: SANS, fontSize: 14, color: "#6D6A64" }}>{p.client}</span>}
                                    <span aria-hidden="true" style={{ justifySelf: "end" }}>↗</span>
                                </a>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </section>
    )
}

addPropertyControls(NoireWorkArchive, {
    projects: {
        type: ControlType.Array,
        title: "Projects",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title" },
                client: { type: ControlType.String, title: "Client" },
                discipline: { type: ControlType.String, title: "Discipline" },
                category: { type: ControlType.String, title: "Category" },
                year: { type: ControlType.String, title: "Year" },
                link: { type: ControlType.Link, title: "Link" },
                image: { type: ControlType.ResponsiveImage, title: "Image" },
            },
        },
        defaultValue: DEFAULT_PROJECTS,
    },
})
