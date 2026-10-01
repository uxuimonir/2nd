// NOIRÉ 2 — Content block (Split / Rows / Cards / FAQ).
// One flexible editorial block used across About, Services and Recognition:
//  - "split": label + large statement + paragraphs + portrait image
//  - "rows":  index rows (timeline, recognition, experience)
//  - "cards": numbered cards (principles, engagement models)
//  - "faq":   accordion of questions (buttons with aria-expanded)
// Dark or light, so sections can alternate rhythm.
import { addPropertyControls, ControlType } from "framer"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { startTransition, useEffect, useId, useRef, useState, type CSSProperties } from "react"

type Item = { a: string; b: string; c: string; link: string }

interface NoireBlocksProps {
    variant: "split" | "rows" | "cards" | "faq"
    label: string
    heading: string
    accent: string
    text: string
    image?: { src: string; alt?: string }
    caption: string
    items: Item[]
    dark: boolean
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'
const EASE = [0.16, 1, 0.3, 1] as const
const IMG = "https://raw.githubusercontent.com/uxuimonir/2nd/83430dfd2a7c2050799516849c47d8f2be688dc7/noire/public/media/"

const DEFAULT_ITEMS: Item[] = [
    { a: "01", b: "Material first", c: "Start from what the thing is made of — paper, clay, stone, light — and let the system grow from there.", link: "" },
    { a: "02", b: "Fewer, better decisions", c: "One typeface pairing. One accent. One idea per page. Every addition has to argue for its place.", link: "" },
    { a: "03", b: "Built to be used", c: "Signs people can read from a distance, books that open flat, websites that load on a train.", link: "" },
    { a: "04", b: "Slow on purpose", c: "We take on a small number of projects and see each one through to production.", link: "" },
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
export default function NoireBlocks(props: NoireBlocksProps) {
    const {
        variant = "cards",
        label = "Principles",
        heading = "How we",
        accent = "work.",
        text = "",
        image = { src: IMG + "about-portrait.webp", alt: "A wooden chair beside a window in a quiet studio." },
        caption = "",
        items = DEFAULT_ITEMS,
        dark = false,
        style,
    } = props
    const root = useRef<HTMLDivElement>(null)
    const w = useWidth(root)
    const uid = useId()
    const reduce = useReducedMotion()
    const [open, setOpen] = useState<number | null>(0)
    const compact = w < 900
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const fg = dark ? "#F7F5F0" : "#11110F"
    const muted = dark ? "#A5A199" : "#6D6A64"
    const line = dark ? "#2E2C28" : "#D3CFC6"
    const surface = dark ? "#1B1A17" : "#EAE6DE"
    const reveal = (i = 0) => (reduce ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-8% 0px" }, transition: { duration: 0.9, delay: i * 0.07, ease: EASE } })

    const head = (
        <div style={{ marginBottom: compact ? 40 : 64 }}>
            <p style={{ margin: "0 0 20px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: muted, display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden="true" style={{ width: 28, height: 1, background: "#D9573F" }} />
                {label}
            </p>
            {heading || accent ? (
                <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: compact ? 44 : 80, lineHeight: 0.98, letterSpacing: "-0.03em", maxWidth: 1000 }}>
                    {heading} {accent ? <em style={{ color: dark ? "#E8735C" : "#D9573F" }}>{accent}</em> : null}
                </h2>
            ) : null}
        </div>
    )

    let body: React.ReactNode = null
    if (variant === "split") {
        body = (
            <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "minmax(0,1.6fr) minmax(0,1fr)", gap: compact ? 48 : 96, alignItems: "end" }}>
                <div>
                    {head}
                    <div style={{ display: "grid", gap: 20, maxWidth: 620 }}>
                        {text.split(/\n\s*\n/).filter(Boolean).map((p, i) => (
                            <motion.p key={i} {...reveal(i)} style={{ margin: 0, fontFamily: SANS, fontSize: compact ? 18 : 21, lineHeight: 1.55, color: muted }}>
                                {p}
                            </motion.p>
                        ))}
                    </div>
                </div>
                {image?.src ? (
                    <motion.figure {...reveal(1)} style={{ margin: 0 }}>
                        <div style={{ aspectRatio: "3 / 4", borderRadius: 22, overflow: "hidden", background: surface }}>
                            <img src={image.src} alt={image.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        {caption ? <figcaption style={{ marginTop: 14, fontFamily: SANS, fontSize: 13, color: muted }}>{caption}</figcaption> : null}
                    </motion.figure>
                ) : null}
            </div>
        )
    } else if (variant === "rows") {
        body = (
            <>
                {head}
                <ul role="list" style={{ listStyle: "none", margin: 0, padding: 0, borderTop: `1px solid ${fg}` }}>
                    {items.map((it, i) => {
                        const Tag = it.link ? "a" : "div"
                        return (
                            <motion.li key={i} {...reveal(Math.min(i, 4))}>
                                <Tag {...(it.link ? { href: it.link } : {})} style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "160px minmax(0,1.3fr) minmax(0,1fr)", gap: compact ? 6 : 24, alignItems: "baseline", padding: compact ? "20px 0" : "28px 0", borderBottom: `1px solid ${line}`, color: fg, textDecoration: "none" }}>
                                    <span style={{ fontFamily: SANS, fontSize: 14, color: muted, fontVariantNumeric: "tabular-nums" }}>{it.a}</span>
                                    <span style={{ fontFamily: SERIF, fontSize: compact ? 28 : 40, lineHeight: 1.1, letterSpacing: "-0.015em" }}>
                                        {it.b}
                                        {it.link ? <span aria-hidden="true" style={{ fontFamily: SANS, fontSize: 18, marginLeft: 10, color: "#D9573F" }}>↗</span> : null}
                                    </span>
                                    <span style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: muted }}>{it.c}</span>
                                </Tag>
                            </motion.li>
                        )
                    })}
                </ul>
            </>
        )
    } else if (variant === "cards") {
        const cols = compact ? (w >= 600 ? 2 : 1) : Math.min(4, Math.max(2, items.length))
        body = (
            <>
                {head}
                <ul role="list" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap: compact ? 16 : 20 }}>
                    {items.map((it, i) => (
                        <motion.li key={i} {...reveal(i)} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 48, minHeight: compact ? 220 : 340, padding: compact ? 24 : 32, borderRadius: 20, background: surface }}>
                            <span style={{ fontFamily: SERIF, fontSize: compact ? 48 : 72, lineHeight: 0.9, letterSpacing: "-0.03em", color: "#D9573F" }}>{it.a}</span>
                            <div>
                                <h3 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: compact ? 28 : 32, lineHeight: 1.1, letterSpacing: "-0.015em" }}>{it.b}</h3>
                                <p style={{ margin: "12px 0 0", fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: muted }}>{it.c}</p>
                                {it.link ? (
                                    <a href={it.link} style={{ display: "inline-block", marginTop: 16, fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: fg, textDecoration: "none", borderBottom: `1px solid ${fg}`, paddingBottom: 3 }}>
                                        Learn more →
                                    </a>
                                ) : null}
                            </div>
                        </motion.li>
                    ))}
                </ul>
            </>
        )
    } else {
        body = (
            <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "minmax(0,1fr) minmax(0,1.6fr)", gap: compact ? 0 : 96 }}>
                <div>{head}</div>
                <ul role="list" style={{ listStyle: "none", margin: 0, padding: 0, borderTop: `1px solid ${line}` }}>
                    {items.map((it, i) => {
                        const isOpen = open === i
                        const id = `${uid}-${i}`
                        return (
                            <li key={i} style={{ borderBottom: `1px solid ${line}` }}>
                                <h3 style={{ margin: 0, fontWeight: 400 }}>
                                    <button type="button" aria-expanded={isOpen} aria-controls={id} onClick={() => startTransition(() => setOpen(isOpen ? null : i))} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, width: "100%", minHeight: 72, padding: "22px 0", border: 0, background: "none", color: fg, textAlign: "left", cursor: "pointer", fontFamily: SERIF, fontSize: compact ? 24 : 30, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                                        {it.b}
                                        <span aria-hidden="true" style={{ flexShrink: 0, display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 99, border: `1px solid ${line}`, fontFamily: SANS, fontSize: 18, transform: isOpen ? "rotate(45deg)" : "none", background: isOpen ? "#D9573F" : "transparent", color: isOpen ? "#11110F" : fg, transition: "transform 260ms ease-out, background 220ms ease-out" }}>
                                            +
                                        </span>
                                    </button>
                                </h3>
                                <AnimatePresence initial={false}>
                                    {isOpen ? (
                                        <motion.div id={id} role="region" aria-label={it.b} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduce ? 0 : 0.45, ease: EASE }} style={{ overflow: "hidden" }}>
                                            <p style={{ margin: 0, padding: "0 56px 26px 0", fontFamily: SANS, fontSize: 17, lineHeight: 1.6, color: muted }}>{it.c}</p>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }

    return (
        <section ref={root} aria-label={label} style={{ ...style, width: "100%", background: dark ? "#11110F" : "#F5F2EC", color: fg, padding: `${compact ? 88 : 140}px ${pad}px` }}>
            {body}
        </section>
    )
}

addPropertyControls(NoireBlocks, {
    variant: { type: ControlType.Enum, title: "Variant", options: ["split", "rows", "cards", "faq"], optionTitles: ["Split", "Rows", "Cards", "FAQ"], defaultValue: "cards" },
    dark: { type: ControlType.Boolean, title: "Dark", defaultValue: false },
    label: { type: ControlType.String, title: "Label", defaultValue: "Principles" },
    heading: { type: ControlType.String, title: "Heading", defaultValue: "How we" },
    accent: { type: ControlType.String, title: "Accent", defaultValue: "work." },
    text: { type: ControlType.String, title: "Text (split)", displayTextArea: true, defaultValue: "" },
    image: { type: ControlType.ResponsiveImage, title: "Image (split)" },
    caption: { type: ControlType.String, title: "Caption (split)", defaultValue: "" },
    items: {
        type: ControlType.Array,
        title: "Items",
        control: {
            type: ControlType.Object,
            controls: {
                a: { type: ControlType.String, title: "Number / year" },
                b: { type: ControlType.String, title: "Title / question" },
                c: { type: ControlType.String, title: "Text / answer", displayTextArea: true },
                link: { type: ControlType.Link, title: "Link" },
            },
        },
        defaultValue: DEFAULT_ITEMS,
    },
})
