// NOIRÉ 2 — 404.
// A visual dead-end that is actually a way forward: status, short message,
// Back home and View work. The image drifts very slightly with the pointer.
import { addPropertyControls, ControlType } from "framer"
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

interface Noire404Props {
    message: string
    image?: { src: string; alt?: string }
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'
const IMG = "https://raw.githubusercontent.com/uxuimonir/2nd/83430dfd2a7c2050799516849c47d8f2be688dc7/noire/public/media/"

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function Noire404(props: Noire404Props) {
    const { message = "This room is empty — the page may have moved, or the link was mistyped. The work is still here.", image = { src: IMG + "notfound.webp", alt: "" }, style } = props
    const root = useRef<HTMLDivElement>(null)
    const reduce = useReducedMotion()
    const [w, setW] = useState(1440)
    const mx = useMotionValue(0)
    const my = useMotionValue(0)
    const x = useSpring(mx, { stiffness: 60, damping: 20 })
    const y = useSpring(my, { stiffness: 60, damping: 20 })
    useEffect(() => {
        if (!root.current || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver((e) => startTransition(() => setW(e[0].contentRect.width)))
        ro.observe(root.current)
        return () => ro.disconnect()
    }, [])
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const compact = w < 900

    return (
        <section
            ref={root}
            aria-labelledby="nf-title"
            onPointerMove={(e) => {
                if (reduce || e.pointerType !== "mouse" || !root.current) return
                const r = root.current.getBoundingClientRect()
                mx.set(((e.clientX - r.left) / r.width - 0.5) * -24)
                my.set(((e.clientY - r.top) / r.height - 0.5) * -24)
            }}
            style={{ ...style, position: "relative", width: "100%", minHeight: "100svh", overflow: "hidden", background: "#11110F", color: "#F7F5F0", display: "flex", alignItems: "flex-end" }}
        >
            <motion.img src={image?.src} alt={image?.alt ?? ""} style={{ position: "absolute", inset: -24, width: "calc(100% + 48px)", height: "calc(100% + 48px)", objectFit: "cover", opacity: 0.6, x, y }} />
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(17,17,15,0.2) 0%, rgba(17,17,15,0.92) 85%)" }} />
            <div style={{ position: "relative", padding: `140px ${pad}px ${compact ? 48 : 72}px`, width: "100%" }}>
                <p style={{ margin: 0, fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#E8735C" }}>Error 404 — Page not found</p>
                <h1 id="nf-title" style={{ margin: "12px 0 0", fontFamily: SERIF, fontWeight: 400, fontSize: compact ? 160 : Math.min(360, w * 0.26), lineHeight: 0.8, letterSpacing: "-0.05em" }}>
                    4<em style={{ color: "#E8735C" }}>0</em>4
                </h1>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 28, marginTop: 40, paddingTop: 24, borderTop: "1px solid rgba(247,245,240,0.2)" }}>
                    <p style={{ margin: 0, maxWidth: 460, fontFamily: SANS, fontSize: 19, lineHeight: 1.5, color: "rgba(247,245,240,0.85)" }}>{message}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                        <a href="/" style={{ display: "inline-flex", alignItems: "center", height: 52, padding: "0 24px", borderRadius: 99, background: "#F7F5F0", color: "#11110F", textDecoration: "none", fontFamily: SANS, fontSize: 13, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>Back home</a>
                        <a href="/work" style={{ display: "inline-flex", alignItems: "center", height: 52, padding: "0 24px", borderRadius: 99, border: "1px solid rgba(247,245,240,0.35)", color: "#F7F5F0", textDecoration: "none", fontFamily: SANS, fontSize: 13, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>View work →</a>
                    </div>
                </div>
            </div>
        </section>
    )
}

addPropertyControls(Noire404, {
    message: { type: ControlType.String, title: "Message", displayTextArea: true, defaultValue: "This room is empty — the page may have moved, or the link was mistyped. The work is still here." },
    image: { type: ControlType.ResponsiveImage, title: "Image" },
})
