// NOIRÉ 2 — Studio archive.
// A calm, curated masonry of sketches, material studies, process fragments and
// behind-the-scenes images, each with kind, year, a note and an optional link
// to the project it belongs to.
import { addPropertyControls, ControlType } from "framer"
import { motion, useReducedMotion } from "framer-motion"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

type Fragment = { title: string; kind: string; year: string; note: string; link: string; linkLabel: string; image?: { src: string; alt?: string } }

interface NoireArchiveProps {
    items: Fragment[]
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'
const IMG = "https://raw.githubusercontent.com/uxuimonir/2nd/83430dfd2a7c2050799516849c47d8f2be688dc7/noire/public/media/"

const DEFAULT_ITEMS: Fragment[] = [
    { title: "Construction of a lowercase a", kind: "Sketch", year: "2026", note: "First drawing for the Quiet Matter wall-text face.", link: "/work/quiet-matter", linkLabel: "Quiet Matter", image: { src: IMG + "a-01.webp" } },
    { title: "Vessel profiles", kind: "Sketch", year: "2024", note: "Three profiles traced from Kiln Room's best sellers.", link: "/work/field-notes-on-clay", linkLabel: "Field Notes on Clay", image: { src: IMG + "a-02.webp" } },
    { title: "Glaze tile tray", kind: "Material study", year: "2024", note: "Twenty tiles, two firings. The palette came from the bottom row.", link: "/work/field-notes-on-clay", linkLabel: "Field Notes on Clay", image: { src: IMG + "a-03.webp" } },
    { title: "Plan for a reading room", kind: "Sketch", year: "2023", note: "Redrawn by hand to test the index-of-rooms taxonomy.", link: "/work/index-of-rooms", linkLabel: "Index of Rooms", image: { src: IMG + "a-04.webp" } },
    { title: "Riso proof, misprinted", kind: "Process fragment", year: "2022", note: "A feed error that became week 31.", link: "/work/paper-weather", linkLabel: "Paper Weather", image: { src: IMG + "a-05.webp" } },
    { title: "Lamp set, night two", kind: "Behind the scenes", year: "2024", note: "Two paper reflectors and patience.", link: "/work/lowlight", linkLabel: "Lowlight", image: { src: IMG + "a-06.webp" } },
    { title: "Stencil stroke studies", kind: "Sketch", year: "2025", note: "Curves for the Tidewater depth numerals.", link: "/work/tidewater", linkLabel: "Tidewater", image: { src: IMG + "a-07.webp" } },
    { title: "Three greens", kind: "Material study", year: "2025", note: "Tile samples from the factory, chosen under pool light.", link: "/work/tidewater", linkLabel: "Tidewater", image: { src: IMG + "a-08.webp" } },
    { title: "A room with one window", kind: "Visual note", year: "2025", note: "Drawn on a train. No project yet.", link: "", linkLabel: "", image: { src: IMG + "a-09.webp" } },
    { title: "Paper stock fan", kind: "Material study", year: "2025", note: "Eleven uncoated stocks considered for Ninefold.", link: "/work/ninefold", linkLabel: "Ninefold", image: { src: IMG + "a-10.webp" } },
    { title: "Notes from a first meeting", kind: "Process fragment", year: "2026", note: "Most briefs start as a page like this.", link: "", linkLabel: "", image: { src: IMG + "a-11.webp" } },
    { title: "Stone sample, for scale", kind: "Material study", year: "2026", note: "Limestone offcut from the Halde plinth maker.", link: "/work/quiet-matter", linkLabel: "Quiet Matter", image: { src: IMG + "a-12.webp" } },
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
export default function NoireArchive(props: NoireArchiveProps) {
    const { items = DEFAULT_ITEMS, style } = props
    const root = useRef<HTMLDivElement>(null)
    const w = useWidth(root)
    const reduce = useReducedMotion()
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const cols = w < 600 ? 1 : w < 1100 ? 2 : 3
    const ratios = ["1 / 1", "4 / 5", "3 / 2"]
    const columns: { it: Fragment; i: number }[][] = Array.from({ length: cols }, () => [])
    items.forEach((it, i) => columns[i % cols].push({ it, i }))

    return (
        <section ref={root} aria-label="Archive" style={{ ...style, width: "100%", background: "#F5F2EC", color: "#11110F", padding: `0 ${pad}px ${w < 900 ? 96 : 160}px` }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap: 24, alignItems: "start" }}>
                {columns.map((col, c) => (
                    <ul key={c} role="list" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 56, marginTop: cols > 1 && c === 1 ? 96 : 0 }}>
                        {col.map(({ it, i }) => (
                            <motion.li key={i} initial={reduce ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-8% 0px" }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
                                <div style={{ aspectRatio: ratios[i % 3], borderRadius: 16, overflow: "hidden", background: "#EAE6DE" }}>
                                    <img src={it.image?.src} alt={it.image?.alt ?? it.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                                <p style={{ display: "flex", justifyContent: "space-between", margin: "14px 0 0", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6D6A64" }}>
                                    <span>{it.kind}</span>
                                    <span>{it.year}</span>
                                </p>
                                <h2 style={{ margin: "8px 0 0", fontFamily: SERIF, fontWeight: 400, fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.01em" }}>{it.title}</h2>
                                <p style={{ margin: "6px 0 0", fontFamily: SANS, fontSize: 15, lineHeight: 1.5, color: "#6D6A64" }}>{it.note}</p>
                                {it.link ? (
                                    <a href={it.link} style={{ display: "inline-block", marginTop: 10, fontFamily: SANS, fontSize: 14, color: "#11110F", borderBottom: "1px solid #11110F", textDecoration: "none" }}>
                                        From {it.linkLabel} →
                                    </a>
                                ) : null}
                            </motion.li>
                        ))}
                    </ul>
                ))}
            </div>
        </section>
    )
}

addPropertyControls(NoireArchive, {
    items: {
        type: ControlType.Array,
        title: "Fragments",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title" },
                kind: { type: ControlType.String, title: "Kind" },
                year: { type: ControlType.String, title: "Year" },
                note: { type: ControlType.String, title: "Note", displayTextArea: true },
                link: { type: ControlType.Link, title: "Project link" },
                linkLabel: { type: ControlType.String, title: "Project name" },
                image: { type: ControlType.ResponsiveImage, title: "Image" },
            },
        },
        defaultValue: DEFAULT_ITEMS,
    },
})
