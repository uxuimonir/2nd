// NOIRÉ 2 — Capabilities.
// 5–7 services as rows that expand on click / tap / Enter (a real accordion,
// usable without hover). On desktop, hovering a row draws a line and reveals a
// thumbnail. Optional dark theme for alternating section rhythm.
import { addPropertyControls, ControlType } from "framer"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { startTransition, useEffect, useId, useRef, useState, type CSSProperties } from "react"

type Item = { number: string; title: string; summary: string; detail: string; includes: string; link: string; image?: { src: string; alt?: string } }

interface NoireServicesProps {
    label: string
    heading: string
    headingItalic: string
    linkLabel: string
    link: string
    items: Item[]
    dark: boolean
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'
const EASE = [0.22, 0.61, 0.36, 1] as const
const IMG = "https://raw.githubusercontent.com/uxuimonir/2nd/dfc52ae6763df67bd2e5dc8f8b76bac7d8ec60f1/noire/public/media/"

const DEFAULT_ITEMS: Item[] = [
    { number: "01", title: "Identity", summary: "Marks, type and systems for institutions and makers.", detail: "We build identities from the material outward — a glaze, a building, a printing process — so the system has a reason to look the way it does.", includes: "Strategy workshop, Mark & typography, Colour from material, Guidelines", link: "/services", image: { src: IMG + "services-identity.webp" } },
    { number: "02", title: "Exhibition", summary: "Exhibition identities, wall texts and wayfinding.", detail: "Graphics that support looking rather than compete with it: reading heights, caption systems, signage and printed matter for a show's whole lifespan.", includes: "Exhibition identity, Wall texts & captions, Wayfinding, Posters & invitations", link: "/services", image: { src: IMG + "services-exhibition.webp" } },
    { number: "03", title: "Editorial & books", summary: "Catalogues, monographs and small-press books.", detail: "From structure to binding. We work closely with editors and printers and stay on press until the last sheet is approved.", includes: "Book structure, Typography, Image sequencing, Production & press checks", link: "/services", image: { src: IMG + "services-editorial.webp" } },
    { number: "04", title: "Spatial", summary: "Signage and identity that live in buildings.", detail: "Signage fired, cast, carved or painted into the building. We collaborate with architects from early design so graphics are part of the fabric.", includes: "Signage strategy, Custom lettering, Material samples, Fabrication drawings", link: "/services", image: { src: IMG + "services-spatial.webp" } },
    { number: "05", title: "Digital & archives", summary: "Websites and archives that are fast to use and calm to read.", detail: "Information architecture first, then design. We favour indexes over carousels and build sites that clients can maintain themselves.", includes: "Content model, Website design, CMS setup, Accessibility review", link: "/services", image: { src: IMG + "services-digital.webp" } },
    { number: "06", title: "Art direction", summary: "Photography and campaigns with a point of view.", detail: "We direct photography for products, spaces and publications — usually with less retouching and more patience than people expect.", includes: "Concept & references, Casting locations, On-set direction, Edit & sequencing", link: "/services", image: { src: IMG + "services-direction.webp" } },
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
export default function NoireServices(props: NoireServicesProps) {
    const { label = "Capabilities", heading = "Six disciplines,", headingItalic = "one way of working.", linkLabel = "Services", link = "/services", items = DEFAULT_ITEMS, dark = true, style } = props
    const root = useRef<HTMLDivElement>(null)
    const w = useWidth(root)
    const uid = useId()
    const reduce = useReducedMotion()
    const [open, setOpen] = useState<number | null>(0)
    const [hover, setHover] = useState<number | null>(null)
    const [canHover, setCanHover] = useState(false)
    const compact = w < 900
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const fg = dark ? "#F7F5F0" : "#11110F"
    const bg = dark ? "#11110F" : "#F5F2EC"
    const muted = dark ? "#A5A199" : "#6D6A64"
    const line = dark ? "#2E2C28" : "#D3CFC6"
    const shown = hover ?? open

    useEffect(() => {
        if (typeof window !== "undefined") startTransition(() => setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches))
    }, [])

    return (
        <section ref={root} aria-labelledby="noire-services" style={{ ...style, width: "100%", background: bg, color: fg, padding: `${compact ? 96 : 160}px ${pad}px` }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24, marginBottom: compact ? 40 : 64 }}>
                <div>
                    <p style={{ margin: "0 0 20px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: muted, display: "flex", alignItems: "center", gap: 10 }}>
                        <span aria-hidden="true" style={{ width: 28, height: 1, background: "#D9573F" }} />
                        {label}
                    </p>
                    <h2 id="noire-services" style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: compact ? 44 : 80, lineHeight: 0.98, letterSpacing: "-0.03em" }}>
                        {heading} <em style={{ color: "#E8735C" }}>{headingItalic}</em>
                    </h2>
                </div>
                <a href={link} style={{ padding: "10px 0 6px", borderBottom: `1px solid ${fg}`, color: fg, textDecoration: "none", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {linkLabel} →
                </a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: compact || !canHover ? "1fr" : "minmax(0,1fr) 360px", gap: 64, alignItems: "start" }}>
                <ul role="list" style={{ listStyle: "none", margin: 0, padding: 0, borderTop: `1px solid ${line}` }} onPointerLeave={() => startTransition(() => setHover(null))}>
                    {items.map((item, i) => {
                        const isOpen = open === i
                        const lit = isOpen || hover === i
                        const panelId = `${uid}-${i}`
                        return (
                            <li key={item.title + i} style={{ position: "relative", borderBottom: `1px solid ${line}` }} onPointerEnter={(e) => e.pointerType === "mouse" && startTransition(() => setHover(i))}>
                                <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 1, background: "#D9573F", transform: `scaleX(${lit ? 1 : 0})`, transformOrigin: "left", transition: "transform 520ms cubic-bezier(.22,.61,.36,1)" }} />
                                <h3 style={{ margin: 0, fontWeight: 400 }}>
                                    <button
                                        type="button"
                                        aria-expanded={isOpen}
                                        aria-controls={panelId}
                                        onClick={() => startTransition(() => setOpen(isOpen ? null : i))}
                                        style={{ display: "grid", gridTemplateColumns: compact ? "36px minmax(0,1fr) 28px" : "56px minmax(0,1fr) minmax(0,1fr) 40px", gap: 16, alignItems: "center", width: "100%", minHeight: 72, padding: compact ? "20px 0" : "26px 0", border: 0, background: "none", color: fg, textAlign: "left", cursor: "pointer", font: "inherit" }}
                                    >
                                        <span style={{ fontFamily: SANS, fontSize: 13, color: muted }}>{item.number}</span>
                                        <span style={{ fontFamily: SERIF, fontSize: compact ? 32 : 48, lineHeight: 1.05, letterSpacing: "-0.02em", fontStyle: lit ? "italic" : "normal" }}>{item.title}</span>
                                        {!compact ? <span style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.5, color: muted }}>{item.summary}</span> : null}
                                        <span aria-hidden="true" style={{ justifySelf: "end", display: "grid", placeItems: "center", width: compact ? 28 : 40, height: compact ? 28 : 40, borderRadius: 99, border: `1px solid ${line}`, fontFamily: SANS, fontSize: 18, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform 260ms ease-out", background: isOpen ? "#D9573F" : "transparent", color: isOpen ? "#11110F" : fg }}>
                                            +
                                        </span>
                                    </button>
                                </h3>
                                <AnimatePresence initial={false}>
                                    {isOpen ? (
                                        <motion.div id={panelId} role="region" aria-label={item.title} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduce ? 0 : 0.5, ease: EASE }} style={{ overflow: "hidden" }}>
                                            <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "1fr 1fr", gap: 24, padding: compact ? "0 0 28px 52px" : "0 0 36px 72px" }}>
                                                <p style={{ margin: 0, fontFamily: SANS, fontSize: 18, lineHeight: 1.55 }}>{item.detail}</p>
                                                <div>
                                                    <ul role="list" aria-label={`${item.title} includes`} style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                        {item.includes.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                                                            <li key={s} style={{ fontFamily: SANS, fontSize: 13, padding: "6px 12px", border: `1px solid ${line}`, borderRadius: 999 }}>{s}</li>
                                                        ))}
                                                    </ul>
                                                    {item.link ? (
                                                        <a href={item.link} style={{ display: "inline-block", marginTop: 20, padding: "8px 0 6px", borderBottom: `1px solid ${fg}`, color: fg, textDecoration: "none", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                                            {item.title} in detail →
                                                        </a>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </li>
                        )
                    })}
                </ul>
                {!compact && canHover ? (
                    <div aria-hidden="true" style={{ position: "sticky", top: 120, aspectRatio: "4 / 5", borderRadius: 18, overflow: "hidden", background: dark ? "#1b1a17" : "#EAE6DE" }}>
                        {items.map((item, i) =>
                            item.image?.src ? <img key={i} src={item.image.src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: shown === i ? 1 : 0, transform: shown === i ? "scale(1)" : "scale(1.06)", transition: "opacity 400ms ease-out, transform 900ms cubic-bezier(.16,1,.3,1)" }} /> : null
                        )}
                    </div>
                ) : null}
            </div>
        </section>
    )
}

addPropertyControls(NoireServices, {
    dark: { type: ControlType.Boolean, title: "Dark", defaultValue: true },
    label: { type: ControlType.String, title: "Label", defaultValue: "Capabilities" },
    heading: { type: ControlType.String, title: "Heading", defaultValue: "Six disciplines," },
    headingItalic: { type: ControlType.String, title: "Heading italic", defaultValue: "one way of working." },
    linkLabel: { type: ControlType.String, title: "Link label", defaultValue: "Services" },
    link: { type: ControlType.Link, title: "Link", defaultValue: "/services" },
    items: {
        type: ControlType.Array,
        title: "Services",
        control: {
            type: ControlType.Object,
            controls: {
                number: { type: ControlType.String, title: "Number" },
                title: { type: ControlType.String, title: "Title" },
                summary: { type: ControlType.String, title: "Summary" },
                detail: { type: ControlType.String, title: "Detail", displayTextArea: true },
                includes: { type: ControlType.String, title: "Includes (comma separated)" },
                link: { type: ControlType.Link, title: "Link" },
                image: { type: ControlType.ResponsiveImage, title: "Image" },
            },
        },
        defaultValue: DEFAULT_ITEMS,
    },
})
