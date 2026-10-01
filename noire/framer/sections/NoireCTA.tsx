// NOIRÉ 2 — Contact statement.
// A huge invitation to start a project, a direct email and a link to the
// form. The round button leans gently toward the cursor on desktop (max 14px);
// it is a normal link everywhere else.
import { addPropertyControls, ControlType } from "framer"
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

interface NoireCTAProps {
    eyebrow: string
    line1: string
    accent: string
    email: string
    buttonLabel: string
    buttonLink: string
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'

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
export default function NoireCTA(props: NoireCTAProps) {
    const { eyebrow = "Booking projects from January 2027", line1 = "Have something that should", accent = "last?", email = "hello@noire.example", buttonLabel = "Start a project", buttonLink = "/contact", style } = props
    const root = useRef<HTMLDivElement>(null)
    const btn = useRef<HTMLAnchorElement>(null)
    const w = useWidth(root)
    const reduce = useReducedMotion()
    const mx = useMotionValue(0)
    const my = useMotionValue(0)
    const x = useSpring(mx, { stiffness: 180, damping: 18 })
    const y = useSpring(my, { stiffness: 180, damping: 18 })
    const compact = w < 900
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const size = compact ? (w < 600 ? 54 : 84) : Math.min(168, w * 0.11)
    const btnSize = compact ? 132 : 188

    const onMove = (e: React.PointerEvent) => {
        if (reduce || e.pointerType !== "mouse" || !btn.current) return
        const r = btn.current.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        const d = Math.hypot(dx, dy)
        if (d < 260) {
            mx.set((dx / 260) * 14)
            my.set((dy / 260) * 14)
        } else {
            mx.set(0)
            my.set(0)
        }
    }

    return (
        <section ref={root} aria-labelledby="noire-cta" onPointerMove={onMove} onPointerLeave={() => { mx.set(0); my.set(0) }} style={{ ...style, width: "100%", background: "#F5F2EC", color: "#11110F", padding: `${compact ? 96 : 180}px ${pad}px`, borderTop: "1px solid #D3CFC6" }}>
            <p style={{ margin: "0 0 32px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6D6A64", display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 99, background: "#D9573F" }} />
                {eyebrow}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "minmax(0,1fr) auto", gap: compact ? 40 : 48, alignItems: "end" }}>
                <h2 id="noire-cta" style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: size, lineHeight: 0.92, letterSpacing: "-0.035em", maxWidth: 1100 }}>
                    {line1} <em style={{ color: "#D9573F" }}>{accent}</em>
                </h2>
                <motion.a
                    ref={btn}
                    href={buttonLink}
                    style={{ x, y, display: "grid", placeItems: "center", width: btnSize, height: btnSize, borderRadius: 999, background: "#11110F", color: "#F7F5F0", textDecoration: "none", fontFamily: SANS, fontSize: 13, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "center", padding: 16, flexShrink: 0 }}
                    whileHover={reduce ? undefined : { backgroundColor: "#D9573F", color: "#11110F" }}
                    transition={{ duration: 0.22 }}
                >
                    <span>
                        {buttonLabel}
                        <br />
                        <span aria-hidden="true" style={{ fontSize: 22 }}>→</span>
                    </span>
                </motion.a>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 40px", alignItems: "baseline", marginTop: compact ? 48 : 72, paddingTop: 28, borderTop: "1px solid #D3CFC6" }}>
                <span style={{ fontFamily: SANS, fontSize: 13, color: "#6D6A64" }}>Or write directly</span>
                <a href={`mailto:${email}`} style={{ fontFamily: SERIF, fontSize: compact ? 32 : 48, lineHeight: 1.1, color: "#11110F", textDecoration: "none", borderBottom: "1px solid #11110F", overflowWrap: "anywhere" }}>
                    {email}
                </a>
            </div>
        </section>
    )
}

addPropertyControls(NoireCTA, {
    eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "Booking projects from January 2027" },
    line1: { type: ControlType.String, title: "Statement", defaultValue: "Have something that should" },
    accent: { type: ControlType.String, title: "Accent", defaultValue: "last?" },
    email: { type: ControlType.String, title: "Email", defaultValue: "hello@noire.example" },
    buttonLabel: { type: ControlType.String, title: "Button", defaultValue: "Start a project" },
    buttonLink: { type: ControlType.Link, title: "Button link", defaultValue: "/contact" },
})
