// NOIRÉ 2 — Page / Intro.
// The opening of every inner page: label, oversized title with an italic
// accent, a lede and optional image. Lines reveal with a mask on load.
// Leaves 72px at the top for the fixed nav.
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useReducedMotion } from "framer-motion"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

interface NoirePageHeroProps {
    label: string
    title: string
    accent: string
    lede: string
    meta: string
    image?: { src: string; alt?: string }
    imageRatio: number
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
    const { label = "Work — 8 projects", title = "Selected work,", accent = "2022 — 2026", lede = "Identities, exhibitions, books, spaces and archives. Switch to the index for a faster, text-only view.", meta = "", image, imageRatio = 1.78, dark = false, style } = props
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
    imageRatio: { type: ControlType.Number, title: "Image ratio", min: 0.5, max: 3, step: 0.01, defaultValue: 1.78 },
    dark: { type: ControlType.Boolean, title: "Dark", defaultValue: false },
})
