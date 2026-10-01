// NOIRÉ 2 — Journal / Notes.
// Three editorial stories: one featured, two supporting. Image crops shift
// slightly on hover; titles and metadata stay put.
import { addPropertyControls, ControlType } from "framer"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

type Story = { title: string; category: string; date: string; excerpt: string; link: string; image?: { src: string; alt?: string } }

interface NoireJournalPreviewProps {
    label: string
    heading: string
    allLabel: string
    allLink: string
    stories: Story[]
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'
const IMG = "https://raw.githubusercontent.com/uxuimonir/2nd/dfc52ae6763df67bd2e5dc8f8b76bac7d8ec60f1/noire/public/media/"

const DEFAULT_STORIES: Story[] = [
    { title: "On restraint, and what it costs", category: "Essay", date: "14 Aug 2026", excerpt: "Restraint is usually described as taking things away. In practice it is mostly about deciding, early, what you will refuse to add later.", link: "/journal/on-restraint", image: { src: IMG + "j-on-restraint.webp" } },
    { title: "A week at the kiln", category: "Process", date: "2 Jun 2026", excerpt: "Notes from five days in Kyoto, watching an identity get fired rather than printed.", link: "/journal/a-week-at-the-kiln", image: { src: IMG + "j-a-week-at-the-kiln.webp" } },
    { title: "Captions are design, too", category: "Notes", date: "21 Mar 2026", excerpt: "A caption decides how long someone looks at an image. Here is how we write and set them.", link: "/journal/captions-are-design", image: { src: IMG + "j-captions-are-design.webp" } },
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

function StoryCard({ s, feature, compact }: { s: Story; feature: boolean; compact: boolean }) {
    const [hover, setHover] = useState(false)
    return (
        <a href={s.link} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)} style={{ display: "block", color: "#11110F", textDecoration: "none" }}>
            <div style={{ aspectRatio: feature ? "4 / 3" : "3 / 2", borderRadius: 16, overflow: "hidden", background: "#EAE6DE" }}>
                <img src={s.image?.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transform: hover ? "scale(1.04)" : "scale(1)", transition: "transform 480ms cubic-bezier(.22,.61,.36,1)" }} />
            </div>
            <p style={{ display: "flex", gap: 14, margin: "18px 0 8px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6D6A64" }}>
                <span style={{ color: "#D9573F" }}>{s.category}</span>
                <span>{s.date}</span>
            </p>
            <h3 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: feature ? (compact ? 36 : 56) : 28, lineHeight: 1.04, letterSpacing: "-0.02em", textDecoration: hover ? "underline" : "none", textDecorationThickness: 1, textUnderlineOffset: "0.14em" }}>{s.title}</h3>
            {feature ? <p style={{ margin: "14px 0 0", maxWidth: 520, fontFamily: SANS, fontSize: 17, lineHeight: 1.55, color: "#6D6A64" }}>{s.excerpt}</p> : null}
        </a>
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function NoireJournalPreview(props: NoireJournalPreviewProps) {
    const { label = "Journal", heading = "Notes on making things slowly.", allLabel = "All notes", allLink = "/journal", stories = DEFAULT_STORIES, style } = props
    const root = useRef<HTMLDivElement>(null)
    const w = useWidth(root)
    const compact = w < 900
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const [first, ...rest] = stories

    return (
        <section ref={root} aria-labelledby="noire-journal" style={{ ...style, width: "100%", background: "#F5F2EC", padding: `${compact ? 96 : 160}px ${pad}px` }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24, marginBottom: 56 }}>
                <div>
                    <p style={{ margin: "0 0 20px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6D6A64", display: "flex", alignItems: "center", gap: 10 }}>
                        <span aria-hidden="true" style={{ width: 28, height: 1, background: "#D9573F" }} />
                        {label}
                    </p>
                    <h2 id="noire-journal" style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: compact ? 44 : 72, lineHeight: 1, letterSpacing: "-0.03em", color: "#11110F", maxWidth: 760 }}>
                        {heading}
                    </h2>
                </div>
                <a href={allLink} style={{ padding: "10px 0 6px", borderBottom: "1px solid #11110F", color: "#11110F", textDecoration: "none", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {allLabel} →
                </a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "minmax(0,1.5fr) minmax(0,1fr)", gap: compact ? 56 : 64 }}>
                {first ? <StoryCard s={first} feature compact={compact} /> : null}
                <div style={{ display: "grid", gridTemplateColumns: w >= 600 && compact ? "1fr 1fr" : "1fr", gap: compact ? 40 : 48, alignContent: "start" }}>
                    {rest.map((s, i) => (
                        <StoryCard key={i} s={s} feature={false} compact={compact} />
                    ))}
                </div>
            </div>
        </section>
    )
}

addPropertyControls(NoireJournalPreview, {
    label: { type: ControlType.String, title: "Label", defaultValue: "Journal" },
    heading: { type: ControlType.String, title: "Heading", defaultValue: "Notes on making things slowly." },
    allLabel: { type: ControlType.String, title: "All label", defaultValue: "All notes" },
    allLink: { type: ControlType.Link, title: "All link", defaultValue: "/journal" },
    stories: {
        type: ControlType.Array,
        title: "Stories",
        maxCount: 3,
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title" },
                category: { type: ControlType.String, title: "Category" },
                date: { type: ControlType.String, title: "Date" },
                excerpt: { type: ControlType.String, title: "Excerpt", displayTextArea: true },
                link: { type: ControlType.Link, title: "Link" },
                image: { type: ControlType.ResponsiveImage, title: "Image" },
            },
        },
        defaultValue: DEFAULT_STORIES,
    },
})
