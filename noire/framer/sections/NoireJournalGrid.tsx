// NOIRÉ 2 — Journal archive.
// Featured story, category chips, editorial cards and a compact index.
import { addPropertyControls, ControlType } from "framer"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

type Story = { title: string; category: string; date: string; read: string; excerpt: string; link: string; image?: { src: string; alt?: string } }

interface NoireJournalGridProps {
    stories: Story[]
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'
const IMG = "https://raw.githubusercontent.com/uxuimonir/2nd/83430dfd2a7c2050799516849c47d8f2be688dc7/noire/public/media/"

const DEFAULT_STORIES: Story[] = [
    { title: "On restraint, and what it costs", category: "Essay", date: "14 Aug 2026", read: "3 min", excerpt: "Restraint is usually described as taking things away. In practice it is mostly about deciding, early, what you will refuse to add later.", link: "/journal/on-restraint", image: { src: IMG + "j-on-restraint.webp" } },
    { title: "A week at the kiln", category: "Process", date: "2 Jun 2026", read: "2 min", excerpt: "Notes from five days in Kyoto with Kiln Room, watching an identity get fired rather than printed.", link: "/journal/a-week-at-the-kiln", image: { src: IMG + "j-a-week-at-the-kiln.webp" } },
    { title: "Captions are design, too", category: "Notes", date: "21 Mar 2026", read: "2 min", excerpt: "A caption decides how long someone looks at an image. Here is how we write and set them.", link: "/journal/captions-are-design", image: { src: IMG + "j-captions-are-design.webp" } },
    { title: "Working in the dark", category: "Process", date: "9 Nov 2025", read: "2 min", excerpt: "How we photographed a lighting collection using nothing but the lamps themselves.", link: "/journal/working-in-the-dark", image: { src: IMG + "j-working-in-the-dark.webp" } },
    { title: "Why we index everything", category: "Studio", date: "30 Jul 2025", read: "2 min", excerpt: "A list is the most underrated layout on the web. Notes on building archives people can actually use.", link: "/journal/why-we-index", image: { src: IMG + "j-why-we-index.webp" } },
    { title: "A studio in January", category: "Studio", date: "18 Jan 2025", read: "1 min", excerpt: "We close for two weeks every winter. This is what we do instead of working.", link: "/journal/a-studio-in-january", image: { src: IMG + "j-a-studio-in-january.webp" } },
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
export default function NoireJournalGrid(props: NoireJournalGridProps) {
    const { stories = DEFAULT_STORIES, style } = props
    const root = useRef<HTMLDivElement>(null)
    const w = useWidth(root)
    const reduce = useReducedMotion()
    const [cat, setCat] = useState<string | null>(null)
    const compact = w < 900
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const cats = Array.from(new Set(stories.map((s) => s.category)))
    const [feature, ...rest] = stories
    const list = cat ? stories.filter((s) => s.category === cat) : rest
    const chip = (on: boolean): CSSProperties => ({ minHeight: 40, padding: "0 16px", borderRadius: 99, border: `1px solid ${on ? "#11110F" : "#D3CFC6"}`, background: on ? "#11110F" : "transparent", color: on ? "#F5F2EC" : "#11110F", fontFamily: SANS, fontSize: 13, cursor: "pointer" })

    return (
        <section ref={root} aria-label="Journal entries" style={{ ...style, width: "100%", background: "#F5F2EC", color: "#11110F", padding: `0 ${pad}px ${compact ? 96 : 160}px` }}>
            {!cat && feature ? (
                <a href={feature.link} style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "minmax(0,1.5fr) minmax(0,1fr)", gap: compact ? 24 : 56, alignItems: "end", marginBottom: compact ? 64 : 112, color: "#11110F", textDecoration: "none" }}>
                    <div style={{ aspectRatio: "16 / 10", borderRadius: 22, overflow: "hidden", background: "#EAE6DE" }}>
                        <img src={feature.image?.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                        <p style={{ margin: "0 0 16px", display: "flex", gap: 14, fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6D6A64" }}>
                            <span style={{ color: "#D9573F" }}>Featured · {feature.category}</span>
                            <span>{feature.date}</span>
                        </p>
                        <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: compact ? 40 : 64, lineHeight: 1, letterSpacing: "-0.03em" }}>{feature.title}</h2>
                        <p style={{ margin: "18px 0 0", fontFamily: SANS, fontSize: 17, lineHeight: 1.55, color: "#6D6A64" }}>{feature.excerpt}</p>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 24, fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid #11110F", paddingBottom: 4 }}>Read the essay →</span>
                    </div>
                </a>
            ) : null}
            <div role="group" aria-label="Filter by category" style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "16px 0", borderTop: "1px solid #D3CFC6", borderBottom: "1px solid #D3CFC6", marginBottom: 48 }}>
                <button type="button" aria-pressed={!cat} style={chip(!cat)} onClick={() => startTransition(() => setCat(null))}>All</button>
                {cats.map((c) => (
                    <button key={c} type="button" aria-pressed={cat === c} style={chip(cat === c)} onClick={() => startTransition(() => setCat(cat === c ? null : c))}>
                        {c}
                    </button>
                ))}
            </div>
            <AnimatePresence mode="wait">
                <motion.ul key={cat ?? "all"} role="list" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.4 }} style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: compact ? (w >= 600 ? "1fr 1fr" : "1fr") : "repeat(3, minmax(0,1fr))", gap: compact ? "48px 20px" : "72px 24px" }}>
                    {list.map((s) => (
                        <li key={s.title}>
                            <a href={s.link} style={{ display: "block", color: "#11110F", textDecoration: "none" }}>
                                <div style={{ aspectRatio: "4 / 3", borderRadius: 16, overflow: "hidden", background: "#EAE6DE" }}>
                                    <img src={s.image?.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                                <p style={{ margin: "16px 0 8px", display: "flex", gap: 14, fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6D6A64" }}>
                                    <span style={{ color: "#D9573F" }}>{s.category}</span>
                                    <span>{s.date}</span>
                                    <span>{s.read}</span>
                                </p>
                                <h3 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: 30, lineHeight: 1.08, letterSpacing: "-0.015em" }}>{s.title}</h3>
                                <p style={{ margin: "10px 0 0", fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: "#6D6A64" }}>{s.excerpt}</p>
                            </a>
                        </li>
                    ))}
                </motion.ul>
            </AnimatePresence>
        </section>
    )
}

addPropertyControls(NoireJournalGrid, {
    stories: {
        type: ControlType.Array,
        title: "Stories (first = featured)",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title" },
                category: { type: ControlType.String, title: "Category" },
                date: { type: ControlType.String, title: "Date" },
                read: { type: ControlType.String, title: "Reading time" },
                excerpt: { type: ControlType.String, title: "Excerpt", displayTextArea: true },
                link: { type: ControlType.Link, title: "Link" },
                image: { type: ControlType.ResponsiveImage, title: "Image" },
            },
        },
        defaultValue: DEFAULT_STORIES,
    },
})
