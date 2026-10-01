// NOIRÉ 2 — Work index section (Project Card / List).
// Dense, keyboard-friendly list: year, project, discipline, client, arrow.
// On desktop with a fine pointer a thumbnail follows the cursor and the other
// rows recede; on touch each row is simply a link. The preview is decorative.
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { startTransition, useCallback, useEffect, useRef, useState, type CSSProperties } from "react"

type Row = { title: string; year: string; discipline: string; client: string; link: string; image?: { src: string; alt?: string } }

interface NoireIndexProps {
    label: string
    heading: string
    linkLabel: string
    link: string
    items: Row[]
    showHeading: boolean
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'
const IMG = "https://raw.githubusercontent.com/uxuimonir/2nd/83430dfd2a7c2050799516849c47d8f2be688dc7/noire/public/media/"

const DEFAULT_ITEMS: Row[] = [
    { title: "Quiet Matter", year: "2026", discipline: "Exhibition identity & catalogue", client: "Halde Kunsthalle", link: "/work/quiet-matter", image: { src: IMG + "p-quiet-matter-hero.webp" } },
    { title: "Tidewater", year: "2025", discipline: "Spatial identity & signage", client: "Baía Baths", link: "/work/tidewater", image: { src: IMG + "p-tidewater-hero.webp" } },
    { title: "Ninefold", year: "2025", discipline: "Book design", client: "Ferro Editions", link: "/work/ninefold", image: { src: IMG + "p-ninefold-hero.webp" } },
    { title: "Lowlight", year: "2024", discipline: "Art direction & campaign", client: "Atelier Ombra", link: "/work/lowlight", image: { src: IMG + "p-lowlight-hero.webp" } },
    { title: "Field Notes on Clay", year: "2024", discipline: "Brand identity", client: "Kiln Room", link: "/work/field-notes-on-clay", image: { src: IMG + "p-field-notes-on-clay-hero.webp" } },
    { title: "Index of Rooms", year: "2023", discipline: "Digital archive & website", client: "Marrow Architects", link: "/work/index-of-rooms", image: { src: IMG + "p-index-of-rooms-hero.webp" } },
    { title: "The Long Table", year: "2023", discipline: "Restaurant identity", client: "Sobremesa", link: "/work/the-long-table", image: { src: IMG + "p-the-long-table-hero.webp" } },
    { title: "Paper Weather", year: "2022", discipline: "Print series", client: "Self-initiated", link: "/work/paper-weather", image: { src: IMG + "p-paper-weather-hero.webp" } },
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
export default function NoireIndex(props: NoireIndexProps) {
    const { label = "Index", heading = "Every project, at a glance.", linkLabel = "Open archive", link = "/work", items = DEFAULT_ITEMS, showHeading = true, style } = props
    const root = useRef<HTMLDivElement>(null)
    const list = useRef<HTMLDivElement>(null)
    const preview = useRef<HTMLDivElement>(null)
    const w = useWidth(root)
    const isStatic = useIsStaticRenderer()
    const [active, setActive] = useState<number | null>(null)
    const [canHover, setCanHover] = useState(false)
    const target = useRef({ x: 0, y: 0 })
    const pos = useRef({ x: 0, y: 0 })
    const compact = w < 900
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const showPreview = canHover && !compact && !isStatic

    useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
        startTransition(() => setCanHover(mq.matches))
    }, [])

    useEffect(() => {
        if (!showPreview) return
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        let frame = 0
        const tick = () => {
            const k = reduce ? 1 : 0.16
            pos.current.x += (target.current.x - pos.current.x) * k
            pos.current.y += (target.current.y - pos.current.y) * k
            if (preview.current) preview.current.style.transform = `translate3d(${pos.current.x + 28}px, ${pos.current.y - 150}px, 0) rotate(${(target.current.x - pos.current.x) * 0.02}deg)`
            frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [showPreview])

    const onMove = useCallback((e: React.PointerEvent) => {
        const r = list.current?.getBoundingClientRect()
        if (r) target.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }, [])

    const cols = compact ? "minmax(0,1fr) auto" : "80px minmax(0,2.4fr) minmax(0,1.4fr) minmax(0,1.1fr) 48px"
    const meta: CSSProperties = { fontFamily: SANS, fontSize: 14, color: "#6D6A64" }

    return (
        <section ref={root} aria-labelledby={showHeading ? "noire-index" : undefined} aria-label={showHeading ? undefined : label} style={{ ...style, width: "100%", background: "#F5F2EC", color: "#11110F", padding: `${compact ? 80 : 120}px ${pad}px` }}>
            {showHeading ? (
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24, marginBottom: 48 }}>
                    <div>
                        <p style={{ margin: "0 0 20px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6D6A64", display: "flex", alignItems: "center", gap: 10 }}>
                            <span aria-hidden="true" style={{ width: 28, height: 1, background: "#D9573F" }} />
                            {label}
                        </p>
                        <h2 id="noire-index" style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: compact ? 44 : 72, lineHeight: 1, letterSpacing: "-0.03em" }}>
                            {heading}
                        </h2>
                    </div>
                    <a href={link} style={{ padding: "10px 0 6px", borderBottom: "1px solid #11110F", color: "#11110F", textDecoration: "none", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {linkLabel} →
                    </a>
                </div>
            ) : null}
            <div ref={list} style={{ position: "relative", borderTop: "1px solid #11110F" }} onPointerMove={showPreview ? onMove : undefined} onPointerLeave={() => startTransition(() => setActive(null))}>
                <ul role="list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {items.map((row, i) => {
                        const on = active === i
                        const dim = active !== null && !on
                        return (
                            <li key={row.title + i}>
                                <a
                                    href={row.link}
                                    onPointerEnter={() => showPreview && startTransition(() => setActive(i))}
                                    onFocus={() => startTransition(() => setActive(null))}
                                    style={{ position: "relative", display: "grid", gridTemplateColumns: cols, gap: compact ? "4px 16px" : 24, alignItems: "center", padding: compact ? "18px 0" : "26px 0", borderBottom: "1px solid #D3CFC6", color: dim ? "#A9A49A" : "#11110F", textDecoration: "none", transition: "color 260ms ease-out" }}
                                >
                                    {compact ? (
                                        <>
                                            <span style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.1, letterSpacing: "-0.015em" }}>{row.title}</span>
                                            <span style={{ ...meta, fontVariantNumeric: "tabular-nums" }}>{row.year}</span>
                                            <span style={meta}>{row.discipline}</span>
                                            <span aria-hidden="true" style={{ justifySelf: "end" }}>↗</span>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ ...meta, color: "inherit", opacity: 0.6, fontVariantNumeric: "tabular-nums" }}>{row.year}</span>
                                            <span style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.02em", transform: on ? "translateX(12px)" : "none", transition: "transform 420ms cubic-bezier(.16,1,.3,1)" }}>
                                                {on ? <em style={{ color: "#D9573F" }}>{row.title}</em> : row.title}
                                            </span>
                                            <span style={{ ...meta, color: "inherit", opacity: 0.7 }}>{row.discipline}</span>
                                            <span style={{ ...meta, color: "inherit", opacity: 0.7 }}>{row.client}</span>
                                            <span aria-hidden="true" style={{ justifySelf: "end", display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 99, border: "1px solid currentColor", background: on ? "#11110F" : "transparent", color: on ? "#F7F5F0" : "inherit", transition: "background 220ms ease-out, color 220ms ease-out" }}>
                                                ↗
                                            </span>
                                        </>
                                    )}
                                </a>
                            </li>
                        )
                    })}
                </ul>
                {showPreview ? (
                    <div ref={preview} aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, width: 280, aspectRatio: "4 / 5", borderRadius: 14, overflow: "hidden", pointerEvents: "none", opacity: active === null ? 0 : 1, transition: "opacity 260ms ease-out", zIndex: 5, background: "#EAE6DE", boxShadow: "0 30px 60px rgba(17,17,15,0.25)" }}>
                        {items.map((row, i) => (row.image?.src ? <img key={i} src={row.image.src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: active === i ? 1 : 0, transition: "opacity 200ms ease-out" }} /> : null))}
                    </div>
                ) : null}
            </div>
        </section>
    )
}

addPropertyControls(NoireIndex, {
    showHeading: { type: ControlType.Boolean, title: "Heading", defaultValue: true },
    label: { type: ControlType.String, title: "Label", defaultValue: "Index" },
    heading: { type: ControlType.String, title: "Heading text", defaultValue: "Every project, at a glance." },
    linkLabel: { type: ControlType.String, title: "Link label", defaultValue: "Open archive" },
    link: { type: ControlType.Link, title: "Link", defaultValue: "/work" },
    items: {
        type: ControlType.Array,
        title: "Projects",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title" },
                year: { type: ControlType.String, title: "Year" },
                discipline: { type: ControlType.String, title: "Discipline" },
                client: { type: ControlType.String, title: "Client" },
                link: { type: ControlType.Link, title: "Link" },
                image: { type: ControlType.ResponsiveImage, title: "Thumbnail" },
            },
        },
        defaultValue: DEFAULT_ITEMS,
    },
})
