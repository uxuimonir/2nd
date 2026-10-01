// NOIRÉ 2 — Page / Intro.
// The opening of every inner page: label, oversized title with an italic
// accent, a lede and optional image. Lines reveal with a mask on load.
// With an image and "Dark" on it becomes a cinematic, near full-height hero
// in the same language as Home: the image fills the frame and settles from
// 1.08 → 1 while scrolling, the statement sits over a soft gradient.
// Leaves 72px at the top for the fixed nav.
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

interface NoirePageHeroProps {
    label: string
    title: string
    accent: string
    lede: string
    meta: string
    image?: { src: string; alt?: string }
    imageRatio: number
    imagePosition?: string
    dark: boolean
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'
const EASE = [0.16, 1, 0.3, 1] as const

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
export default function NoirePageHero(props: NoirePageHeroProps) {
    const { label = "Work — 8 projects", title = "Selected work,", accent = "2022 — 2026", lede = "Identities, exhibitions, books, spaces and archives. Switch to the index for a faster, text-only view.", meta = "", image, imageRatio = 1.78, imagePosition = "50% 50%", dark = false, style } = props
    const root = useRef<HTMLDivElement>(null)
    const w = useWidth(root)
    const isStatic = useIsStaticRenderer()
    const reduce = Boolean(useReducedMotion() || isStatic)
    const compact = w < 900
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const size = w < 600 ? 52 : w < 900 ? 76 : w < 1200 ? 104 : 136
    const fg = dark ? "#F7F5F0" : "#11110F"
    const muted = dark ? "#A5A199" : "#6D6A64"
    const enter = (d: number) => (reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: d, ease: EASE } })
    const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end start"] })
    const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.08, 1])
    const lift = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -90])
    const fade = useTransform(scrollYProgress, [0, 0.75], [1, reduce ? 1 : 0.25])
    const mask = (text: React.ReactNode, delay: number, accentLine = false) => (
        <span style={{ display: "block", overflow: "hidden", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
            <motion.span style={{ display: "block", fontStyle: accentLine ? "italic" : undefined, color: accentLine ? (dark ? "#E8735C" : "#D9573F") : undefined }} initial={reduce ? false : { y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 1.1, delay, ease: EASE }}>
                {text}
            </motion.span>
        </span>
    )

    if (image?.src && dark) {
        return (
            <section ref={root} style={{ ...style, position: "relative", width: "100%", minHeight: compact ? 640 : 780, height: compact ? "auto" : "92svh", maxHeight: 1040, overflow: "hidden", background: "#11110F", color: "#F7F5F0", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <motion.div style={{ position: "absolute", inset: 0, scale, transformOrigin: "50% 40%" }}>
                    <motion.img src={image.src} alt={image.alt ?? ""} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, ease: EASE }} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: imagePosition }} />
                    <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(17,17,15,0.6) 0%, rgba(17,17,15,0.18) 34%, rgba(17,17,15,0.3) 56%, rgba(17,17,15,0.93) 100%)" }} />
                </motion.div>
                <motion.div style={{ position: "relative", padding: `140px ${pad}px ${compact ? 32 : 48}px`, y: lift, opacity: fade }}>
                    <motion.p {...enter(0.15)} style={{ margin: "0 0 28px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(247,245,240,0.78)", display: "flex", alignItems: "center", gap: 10 }}>
                        <span aria-hidden="true" style={{ width: 28, height: 1, background: "#D9573F" }} />
                        {label}
                    </motion.p>
                    <h1 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: w < 600 ? 50 : w < 900 ? 76 : w < 1200 ? 104 : Math.min(148, w * 0.095), lineHeight: 0.94, letterSpacing: "-0.03em", maxWidth: 1240 }}>
                        {mask(title, 0.25)}
                        {accent ? mask(accent, 0.37, true) : null}
                    </h1>
                    <motion.div {...enter(0.6)} style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginTop: compact ? 32 : 48, paddingTop: 24, borderTop: "1px solid rgba(247,245,240,0.22)" }}>
                        {lede ? <p style={{ margin: 0, maxWidth: 480, fontFamily: SANS, fontSize: compact ? 17 : 19, lineHeight: 1.5, color: "rgba(247,245,240,0.84)" }}>{lede}</p> : <span />}
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 14, fontFamily: SANS, fontSize: 13, color: "rgba(247,245,240,0.62)" }}>
                            {meta || "Scroll"}
                            <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 99, border: "1px solid rgba(247,245,240,0.3)", color: "#F7F5F0" }}>↓</span>
                        </span>
                    </motion.div>
                </motion.div>
            </section>
        )
    }

    return (
        <section ref={root} style={{ ...style, width: "100%", background: dark ? "#11110F" : "#F5F2EC", color: fg, padding: `${compact ? 140 : 200}px ${pad}px ${image?.src ? 0 : compact ? 64 : 112}px` }}>
            <motion.p {...enter(0.1)} style={{ margin: "0 0 28px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: muted, display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden="true" style={{ width: 28, height: 1, background: "#D9573F" }} />
                {label}
            </motion.p>
            <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "minmax(0,2fr) minmax(0,1fr)", gap: compact ? 32 : 64, alignItems: "end" }}>
                <h1 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: size, lineHeight: 0.94, letterSpacing: "-0.035em" }}>
                    <span style={{ display: "block", overflow: "hidden", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
                        <motion.span style={{ display: "block" }} initial={reduce ? false : { y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 1.1, delay: 0.15, ease: EASE }}>
                            {title}
                        </motion.span>
                    </span>
                    {accent ? (
                        <span style={{ display: "block", overflow: "hidden", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
                            <motion.em style={{ display: "block", color: "#D9573F" }} initial={reduce ? false : { y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 1.1, delay: 0.27, ease: EASE }}>
                                {accent}
                            </motion.em>
                        </span>
                    ) : null}
                </h1>
                <motion.div {...enter(0.45)}>
                    {lede ? <p style={{ margin: 0, maxWidth: 440, fontFamily: SANS, fontSize: compact ? 17 : 19, lineHeight: 1.55, color: muted }}>{lede}</p> : null}
                    {meta ? <p style={{ margin: "20px 0 0", fontFamily: SANS, fontSize: 13, color: muted }}>{meta}</p> : null}
                </motion.div>
            </div>
            {image?.src ? (
                <motion.div
                    initial={reduce ? false : { clipPath: "inset(12% 6% 0% 6% round 22px)" }}
                    animate={{ clipPath: "inset(0% 0% 0% 0% round 22px)" }}
                    transition={{ duration: 1.3, delay: 0.3, ease: EASE }}
                    style={{ marginTop: compact ? 48 : 80, aspectRatio: String(imageRatio), borderRadius: 22, overflow: "hidden", background: "#EAE6DE" }}
                >
                    <img src={image.src} alt={image.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </motion.div>
            ) : null}
        </section>
    )
}

addPropertyControls(NoirePageHero, {
    label: { type: ControlType.String, title: "Label", defaultValue: "Work — 8 projects" },
    title: { type: ControlType.String, title: "Title", defaultValue: "Selected work," },
    accent: { type: ControlType.String, title: "Accent line", defaultValue: "2022 — 2026" },
    lede: { type: ControlType.String, title: "Lede", displayTextArea: true, defaultValue: "Identities, exhibitions, books, spaces and archives. Switch to the index for a faster, text-only view." },
    meta: { type: ControlType.String, title: "Meta", defaultValue: "" },
    image: { type: ControlType.ResponsiveImage, title: "Image" },
    imageRatio: { type: ControlType.Number, title: "Image ratio (light)", min: 0.5, max: 3, step: 0.01, defaultValue: 1.78 },
    imagePosition: { type: ControlType.String, title: "Image focus", defaultValue: "50% 50%" },
    dark: { type: ControlType.Boolean, title: "Dark (cinematic with image)", defaultValue: false },
})
