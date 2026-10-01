// NOIRÉ 2 — Manifesto (the emotional reset).
// A large editorial statement whose words light up as the reader scrolls
// through it (opacity only — no movement), next to one supporting image.
// Reduced motion shows the text fully lit.
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

interface NoireManifestoProps {
    label: string
    text: string
    accentWords: string
    signature: string
    signatureLink: string
    image: { src: string; alt?: string }
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'
const IMG = "https://raw.githubusercontent.com/uxuimonir/2nd/dfc52ae6763df67bd2e5dc8f8b76bac7d8ec60f1/noire/public/media/"

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

function Word({ word, i, total, progress, accent, lit }: { word: string; i: number; total: number; progress: MotionValue<number>; accent: boolean; lit: boolean }) {
    const opacity = useTransform(progress, [i / total, (i + 1) / total], lit ? [1, 1] : [0.18, 1])
    return (
        <motion.span style={{ opacity, color: accent ? "#E8735C" : undefined, fontStyle: accent ? "italic" : undefined }}>
            {word}{" "}
        </motion.span>
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function NoireManifesto(props: NoireManifestoProps) {
    const {
        label = "Manifesto",
        text = "We start with the material, add as little as we can, and stay until it is made. Restraint is not an aesthetic — it is a decision we make early and keep.",
        accentWords = "made., decision",
        signature = "Mira Solberg, founder — About the studio",
        signatureLink = "/about",
        image = { src: IMG + "home-manifesto.webp", alt: "Sunlight falling as a sharp-edged patch across a raw concrete wall." },
        style,
    } = props
    const root = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    const w = useWidth(root)
    const isStatic = useIsStaticRenderer()
    const lit = Boolean(useReducedMotion() || isStatic)
    const { scrollYProgress } = useScroll({ target: textRef, offset: ["start 0.85", "end 0.45"] })
    const words = text.split(/\s+/).filter(Boolean)
    const accents = accentWords.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    const compact = w < 900
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48

    return (
        <section ref={root} aria-label={label} style={{ ...style, width: "100%", background: "#11110F", color: "#F7F5F0", padding: `${compact ? 96 : 180}px ${pad}px` }}>
            <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "minmax(0,2.2fr) minmax(0,1fr)", gap: compact ? 48 : 80, alignItems: "end" }}>
                <div>
                    <p style={{ margin: "0 0 32px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#A5A199", display: "flex", alignItems: "center", gap: 10 }}>
                        <span aria-hidden="true" style={{ width: 28, height: 1, background: "#D9573F" }} />
                        {label}
                    </p>
                    <div ref={textRef}>
                        <p style={{ margin: 0, fontFamily: SERIF, fontSize: compact ? 40 : w < 1200 ? 60 : 76, lineHeight: 1.05, letterSpacing: "-0.025em" }}>
                            {words.map((word, i) => (
                                <Word key={i} word={word} i={i} total={words.length} progress={scrollYProgress} lit={lit} accent={accents.includes(word.toLowerCase())} />
                            ))}
                        </p>
                    </div>
                    <a href={signatureLink} style={{ display: "inline-block", marginTop: 40, fontFamily: SANS, fontSize: 14, color: "#A5A199", textDecoration: "none", borderBottom: "1px solid #3a3833", paddingBottom: 4 }}>
                        {signature} →
                    </a>
                </div>
                <div style={{ width: compact ? "70%" : "100%", maxWidth: 420, justifySelf: compact ? "start" : "end" }}>
                    <div style={{ aspectRatio: "4 / 5", borderRadius: 18, overflow: "hidden", background: "#1b1a17" }}>
                        <img src={image?.src} alt={image?.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                </div>
            </div>
        </section>
    )
}

addPropertyControls(NoireManifesto, {
    label: { type: ControlType.String, title: "Label", defaultValue: "Manifesto" },
    text: { type: ControlType.String, title: "Statement", displayTextArea: true, defaultValue: "We start with the material, add as little as we can, and stay until it is made. Restraint is not an aesthetic — it is a decision we make early and keep." },
    accentWords: { type: ControlType.String, title: "Accent words", defaultValue: "made., decision" },
    signature: { type: ControlType.String, title: "Signature", defaultValue: "Mira Solberg, founder — About the studio" },
    signatureLink: { type: ControlType.Link, title: "Signature link", defaultValue: "/about" },
    image: { type: ControlType.ResponsiveImage, title: "Image" },
})
