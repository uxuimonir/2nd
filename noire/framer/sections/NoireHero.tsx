// NOIRÉ 2 — Hero.
// Full-height editorial hero: one art-directed image, an oversized statement
// revealed line by line (mask), a descriptor, one primary action and studio
// metadata. Scroll-linked: the image scales 1.08 → 1 and the statement drifts
// up as the next section enters. Reduced motion: static.
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

interface NoireHeroProps {
    eyebrow: string
    line1: string
    line2: string
    accent: string
    descriptor: string
    ctaLabel: string
    ctaLink: string
    image: { src: string; alt?: string }
    caption: string
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'
const EASE = [0.16, 1, 0.3, 1] as const
const IMG = "https://raw.githubusercontent.com/uxuimonir/2nd/83430dfd2a7c2050799516849c47d8f2be688dc7/noire/public/media/"

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

function Line({ children, delay, reduce }: { children: React.ReactNode; delay: number; reduce: boolean }) {
    return (
        <span style={{ display: "block", overflow: "hidden", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
            <motion.span style={{ display: "block" }} initial={reduce ? false : { y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 1.1, delay, ease: EASE }}>
                {children}
            </motion.span>
        </span>
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function NoireHero(props: NoireHeroProps) {
    const {
        eyebrow = "Independent studio — Lisbon",
        line1 = "Identities, exhibitions",
        line2 = "and rooms that",
        accent = "hold attention.",
        descriptor = "Noiré works with cultural institutions and makers — from first idea to the last printed sheet.",
        ctaLabel = "See selected work",
        ctaLink = "/work",
        image = { src: IMG + "home-hero.webp", alt: "Late sun falling through a tall window across a plaster wall." },
        caption = "Studio, late afternoon",
        style,
    } = props
    const root = useRef<HTMLDivElement>(null)
    const w = useWidth(root)
    const isStatic = useIsStaticRenderer()
    const reduceMotion = useReducedMotion()
    const reduce = Boolean(reduceMotion || isStatic)
    const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end start"] })
    const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.08, 1])
    const lift = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -120])
    const fade = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0.2])

    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const size = w < 600 ? 50 : w < 900 ? 76 : w < 1200 ? 104 : Math.min(156, w * 0.1)
    const narrow = w < 900

    return (
        <section ref={root} aria-label="Introduction" style={{ ...style, position: "relative", width: "100%", minHeight: narrow ? 760 : 900, height: narrow ? "auto" : "100svh", maxHeight: 1100, overflow: "hidden", background: "#11110F", color: "#F7F5F0", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <motion.div aria-hidden={!image?.alt} style={{ position: "absolute", inset: 0, scale, transformOrigin: "50% 40%" }}>
                <motion.img
                    src={image?.src}
                    alt={image?.alt ?? ""}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.6, ease: EASE }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "60% 50%" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(17,17,15,0.55) 0%, rgba(17,17,15,0.15) 35%, rgba(17,17,15,0.25) 55%, rgba(17,17,15,0.92) 100%)" }} />
            </motion.div>

            <motion.div style={{ position: "relative", padding: `140px ${pad}px ${narrow ? 32 : 48}px`, y: lift, opacity: fade }}>
                <motion.p initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: EASE }} style={{ margin: "0 0 28px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(247,245,240,0.75)", display: "flex", alignItems: "center", gap: 10 }}>
                    <span aria-hidden="true" style={{ width: 28, height: 1, background: "#D9573F" }} />
                    {eyebrow}
                </motion.p>
                <h1 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: size, lineHeight: 0.94, letterSpacing: "-0.03em" }}>
                    <Line delay={0.25} reduce={reduce}>{line1}</Line>
                    <Line delay={0.37} reduce={reduce}>{line2}</Line>
                    <Line delay={0.49} reduce={reduce}>
                        <em style={{ color: "#E8735C" }}>{accent}</em>
                    </Line>
                </h1>
                <motion.div
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.75, ease: EASE }}
                    style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 28, marginTop: narrow ? 32 : 48, paddingTop: 24, borderTop: "1px solid rgba(247,245,240,0.22)" }}
                >
                    <p style={{ margin: 0, maxWidth: 440, fontFamily: SANS, fontSize: narrow ? 17 : 19, lineHeight: 1.5, color: "rgba(247,245,240,0.82)" }}>{descriptor}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
                        {!narrow ? <span style={{ fontFamily: SANS, fontSize: 13, color: "rgba(247,245,240,0.6)" }}>{caption}</span> : null}
                        <a href={ctaLink} style={{ display: "inline-flex", alignItems: "center", gap: 14, height: 56, padding: "0 8px 0 24px", borderRadius: 999, background: "#F7F5F0", color: "#11110F", textDecoration: "none", fontFamily: SANS, fontSize: 13, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                            {ctaLabel}
                            <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 99, background: "#D9573F", color: "#11110F", fontSize: 16 }}>
                                →
                            </span>
                        </a>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    )
}

addPropertyControls(NoireHero, {
    eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "Independent studio — Lisbon" },
    line1: { type: ControlType.String, title: "Line 1", defaultValue: "Identities, exhibitions" },
    line2: { type: ControlType.String, title: "Line 2", defaultValue: "and rooms that" },
    accent: { type: ControlType.String, title: "Accent line", defaultValue: "hold attention." },
    descriptor: { type: ControlType.String, title: "Descriptor", displayTextArea: true, defaultValue: "Noiré works with cultural institutions and makers — from first idea to the last printed sheet." },
    ctaLabel: { type: ControlType.String, title: "Button", defaultValue: "See selected work" },
    ctaLink: { type: ControlType.Link, title: "Button link", defaultValue: "/work" },
    image: { type: ControlType.ResponsiveImage, title: "Image" },
    caption: { type: ControlType.String, title: "Caption", defaultValue: "Studio, late afternoon" },
})
