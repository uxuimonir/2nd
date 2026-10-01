// NOIRÉ 2 — Journal detail / long-form text (also used for Legal & Colophon).
// Cinematic cover hero (title over the image, like Home) with category, date
// and reading time — or a plain text header without a cover; long-form body
// written in a light markdown (## heading, > pull quote, [img] url | caption);
// reading progress bar; newer/older navigation.
import { addPropertyControls, ControlType } from "framer"
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

interface NoireArticleProps {
    category: string
    title: string
    date: string
    author: string
    excerpt: string
    cover?: { src: string; alt?: string }
    body: string
    backLabel: string
    backLink: string
    prevLabel: string
    prevLink: string
    nextLabel: string
    nextLink: string
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'
const EASE = [0.16, 1, 0.3, 1] as const
const IMG = "https://raw.githubusercontent.com/uxuimonir/2nd/dfc52ae6763df67bd2e5dc8f8b76bac7d8ec60f1/noire/public/media/"

const DEFAULT_BODY = `Every project reaches a point where something feels missing. The page looks quiet, the room looks empty, the catalogue looks unfinished. The instinct is to add — a second typeface, a colour, a pattern, a line of copy that explains what the image already says.

Most of the time, that feeling is not a sign that something is missing. It is the discomfort of seeing a thing at its actual size. Restraint is learning to sit with that discomfort long enough to tell the difference.

## Deciding early

We now write a short list at the start of each project: the things we will not do. No second display face. No colour that does not come from the material. No motion that does not explain something.

> A constraint written down in week one is a decision. The same constraint discovered in week ten is a compromise.

[img] ${IMG}j-on-restraint-break.webp | An empty room is not an unfinished room. Halde Kunsthalle, install week.

## What it costs

Restraint is not free. Quiet work is harder to sell in a pitch, harder to photograph, and easier to dismiss as unfinished. When it works, though, the result tends to last. Things that do less tend to age more slowly.`

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
export default function NoireArticle(props: NoireArticleProps) {
    const {
        category = "Essay",
        title = "On restraint, and what it costs",
        date = "14 August 2026",
        author = "Mira Solberg",
        excerpt = "Restraint is usually described as taking things away. In practice it is mostly about deciding, early, what you will refuse to add later.",
        cover = { src: IMG + "j-on-restraint.webp", alt: "Blank folded sheets of paper in soft side light." },
        body = DEFAULT_BODY,
        backLabel = "All journal entries",
        backLink = "/journal",
        prevLabel = "",
        prevLink = "",
        nextLabel = "A week at the kiln",
        nextLink = "/journal/a-week-at-the-kiln",
        style,
    } = props
    const root = useRef<HTMLDivElement>(null)
    const w = useWidth(root)
    const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end end"] })
    const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 })
    const heroRef = useRef<HTMLElement>(null)
    const reduce = Boolean(useReducedMotion())
    const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
    const coverScale = useTransform(heroProgress, [0, 1], reduce ? [1, 1] : [1.08, 1])
    const coverLift = useTransform(heroProgress, [0, 1], reduce ? [0, 0] : [0, -90])
    const compact = w < 900
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const words = body.split(/\s+/).length
    const minutes = Math.max(1, Math.round(words / 220))
    const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)

    return (
        <article ref={root} style={{ ...style, position: "relative", width: "100%", background: "#F5F2EC", color: "#11110F" }}>
            <div aria-hidden="true" style={{ position: "sticky", top: 72, zIndex: 3, height: 0 }}>
                <motion.div style={{ height: 3, background: "#D9573F", transformOrigin: "left", scaleX: progress }} />
            </div>
            {cover?.src ? (
                <header ref={heroRef} style={{ position: "relative", minHeight: compact ? 620 : 760, height: compact ? "auto" : "90svh", maxHeight: 1020, overflow: "hidden", background: "#11110F", color: "#F7F5F0", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <motion.div style={{ position: "absolute", inset: 0, scale: coverScale, transformOrigin: "50% 40%" }}>
                        <motion.img src={cover.src} alt={cover.alt ?? ""} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, ease: EASE }} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(17,17,15,0.62) 0%, rgba(17,17,15,0.16) 34%, rgba(17,17,15,0.32) 56%, rgba(17,17,15,0.94) 100%)" }} />
                    </motion.div>
                    <motion.div style={{ position: "relative", padding: `140px ${pad}px ${compact ? 32 : 56}px`, maxWidth: 1340, y: coverLift }}>
                        <p style={{ margin: "0 0 28px", display: "flex", flexWrap: "wrap", gap: "8px 18px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(247,245,240,0.72)" }}>
                            <span style={{ color: "#E8735C" }}>{category}</span>
                            {date ? <span>{date}</span> : null}
                            {category ? <span>{minutes} min read</span> : null}
                        </p>
                        <h1 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: compact ? 52 : Math.min(124, w * 0.088), lineHeight: 0.96, letterSpacing: "-0.035em" }}>
                            <span style={{ display: "block", overflow: "hidden", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
                                <motion.span style={{ display: "block" }} initial={reduce ? false : { y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 1.1, delay: 0.2, ease: EASE }}>
                                    {title}
                                </motion.span>
                            </span>
                        </h1>
                        {excerpt ? <p style={{ margin: "28px 0 0", maxWidth: 640, fontFamily: SANS, fontSize: compact ? 18 : 22, lineHeight: 1.5, color: "rgba(247,245,240,0.84)" }}>{excerpt}</p> : null}
                    </motion.div>
                </header>
            ) : (
                <header style={{ padding: `${compact ? 130 : 180}px ${pad}px ${compact ? 40 : 64}px`, maxWidth: 1240 }}>
                    <p style={{ margin: "0 0 28px", display: "flex", flexWrap: "wrap", gap: "8px 18px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6D6A64" }}>
                        <span style={{ color: "#D9573F" }}>{category}</span>
                        {date ? <span>{date}</span> : null}
                        {category ? <span>{minutes} min read</span> : null}
                    </p>
                    <h1 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: compact ? 52 : Math.min(120, w * 0.085), lineHeight: 0.96, letterSpacing: "-0.035em" }}>{title}</h1>
                    {excerpt ? <p style={{ margin: "28px 0 0", maxWidth: 620, fontFamily: SANS, fontSize: compact ? 18 : 22, lineHeight: 1.5, color: "#6D6A64" }}>{excerpt}</p> : null}
                </header>
            )}
            <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "minmax(0,1fr) minmax(0,2.2fr) minmax(0,0.6fr)", gap: compact ? 32 : 48, padding: `${compact ? 56 : 112}px ${pad}px` }}>
                <aside style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.7, color: "#6D6A64", ...(compact ? {} : { position: "sticky", top: 110, alignSelf: "start" }) }}>
                    {author ? <p style={{ margin: 0 }}>By {author}</p> : null}
                    {date ? <p style={{ margin: 0 }}>{date}</p> : null}
                    <a href={backLink} style={{ display: "inline-block", marginTop: 16, color: "#11110F", textDecoration: "none", borderBottom: "1px solid #11110F" }}>
                        ← {backLabel}
                    </a>
                </aside>
                <div style={{ maxWidth: 720 }}>
                    {blocks.map((b, i) => {
                        if (b.startsWith("## ")) return <h2 key={i} style={{ margin: "56px 0 0", fontFamily: SERIF, fontWeight: 400, fontSize: compact ? 34 : 44, lineHeight: 1.1, letterSpacing: "-0.02em" }}>{b.slice(3)}</h2>
                        if (b.startsWith("> "))
                            return (
                                <blockquote key={i} style={{ margin: "56px 0", padding: "8px 0 8px 28px", borderLeft: "2px solid #D9573F" }}>
                                    <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: compact ? 32 : 46, lineHeight: 1.12, letterSpacing: "-0.02em" }}>“{b.slice(2)}”</p>
                                </blockquote>
                            )
                        if (b.startsWith("[img] ")) {
                            const [src, cap = ""] = b.slice(6).split("|").map((s) => s.trim())
                            return (
                                <figure key={i} style={{ margin: compact ? "40px 0" : "64px -12% 64px 0" }}>
                                    <div style={{ aspectRatio: "16 / 9", borderRadius: 18, overflow: "hidden", background: "#EAE6DE" }}>
                                        <img src={src} alt={cap} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </div>
                                    {cap ? <figcaption style={{ marginTop: 12, fontFamily: SANS, fontSize: 13, color: "#6D6A64" }}>{cap}</figcaption> : null}
                                </figure>
                            )
                        }
                        return <p key={i} style={{ margin: "22px 0 0", fontFamily: SANS, fontSize: compact ? 18 : 20, lineHeight: 1.7 }}>{b}</p>
                    })}
                </div>
            </div>
            {prevLink || nextLink ? (
                <nav aria-label="More entries" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, margin: `0 ${pad}px`, padding: `0 0 ${compact ? 80 : 140}px` }}>
                    {[
                        { label: prevLabel, link: prevLink, dir: "← Newer" },
                        { label: nextLabel, link: nextLink, dir: "Older →" },
                    ].map((n, i) =>
                        n.link ? (
                            <a key={i} href={n.link} style={{ display: "grid", gap: 8, padding: "24px 0", borderTop: "1px solid #11110F", color: "#11110F", textDecoration: "none", textAlign: i ? "right" : "left", gridColumn: i ? 2 : 1 }}>
                                <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6D6A64" }}>{n.dir}</span>
                                <span style={{ fontFamily: SERIF, fontSize: compact ? 24 : 36, lineHeight: 1.1 }}>{n.label}</span>
                            </a>
                        ) : null
                    )}
                </nav>
            ) : null}
        </article>
    )
}

addPropertyControls(NoireArticle, {
    category: { type: ControlType.String, title: "Category", defaultValue: "Essay" },
    title: { type: ControlType.String, title: "Title", defaultValue: "On restraint, and what it costs" },
    date: { type: ControlType.String, title: "Date", defaultValue: "14 August 2026" },
    author: { type: ControlType.String, title: "Author", defaultValue: "Mira Solberg" },
    excerpt: { type: ControlType.String, title: "Excerpt", displayTextArea: true },
    cover: { type: ControlType.ResponsiveImage, title: "Cover" },
    body: { type: ControlType.String, title: "Body (## heading, > quote, [img] url | caption)", displayTextArea: true, defaultValue: DEFAULT_BODY },
    backLabel: { type: ControlType.String, title: "Back label", defaultValue: "All journal entries" },
    backLink: { type: ControlType.Link, title: "Back link", defaultValue: "/journal" },
    prevLabel: { type: ControlType.String, title: "Newer title", defaultValue: "" },
    prevLink: { type: ControlType.Link, title: "Newer link", defaultValue: "" },
    nextLabel: { type: ControlType.String, title: "Older title", defaultValue: "A week at the kiln" },
    nextLink: { type: ControlType.Link, title: "Older link", defaultValue: "/journal/a-week-at-the-kiln" },
})
