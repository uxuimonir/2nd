// NOIRÉ 2 — Marquee.
// A slow typographic band (disciplines or client names) used as a quiet
// transition between dense sections. Pauses on hover/focus; static and fully
// readable with reduced motion.
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { useReducedMotion } from "framer-motion"
import { useState, type CSSProperties } from "react"

interface NoireMarqueeProps {
    items: string
    speed: number
    dark: boolean
    italic: boolean
    size: number
    style?: CSSProperties
}

const SERIF = '"Instrument Serif", "Times New Roman", serif'

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function NoireMarquee(props: NoireMarqueeProps) {
    const { items = "Identity, Exhibition, Editorial, Spatial, Digital archives, Art direction", speed = 40, dark = false, italic = true, size = 72, style } = props
    const isStatic = useIsStaticRenderer()
    const reduce = useReducedMotion() || isStatic
    const [paused, setPaused] = useState(false)
    const words = items.split(",").map((s) => s.trim()).filter(Boolean)
    const fg = dark ? "#F7F5F0" : "#11110F"
    const bg = dark ? "#11110F" : "#F5F2EC"

    const row = (hidden: boolean) => (
        <div aria-hidden={hidden || undefined} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            {words.map((w, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
                    <span style={{ fontFamily: SERIF, fontStyle: italic && i % 2 === 1 ? "italic" : "normal", fontSize: size, lineHeight: 1.1, letterSpacing: "-0.02em", whiteSpace: "nowrap", padding: "0 0.35em" }}>{w}</span>
                    <span aria-hidden="true" style={{ width: size * 0.16, height: size * 0.16, borderRadius: 99, background: "#D9573F", flexShrink: 0 }} />
                </span>
            ))}
        </div>
    )

    return (
        <div
            style={{ ...style, position: "relative", width: "100%", overflow: "hidden", background: bg, color: fg, padding: `${Math.round(size * 0.4)}px 0`, borderTop: `1px solid ${dark ? "#2a2925" : "#D3CFC6"}`, borderBottom: `1px solid ${dark ? "#2a2925" : "#D3CFC6"}` }}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
        >
            <style>{"@keyframes noire-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }"}</style>
            <p style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                {words.join(", ")}
            </p>
            {reduce ? (
                <div aria-hidden="true" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>{row(true)}</div>
            ) : (
                <div aria-hidden="true" style={{ display: "flex", width: "max-content", animationName: "noire-marquee", animationDuration: `${Math.max(8, 100 - speed)}s`, animationTimingFunction: "linear", animationIterationCount: "infinite", animationPlayState: paused ? "paused" : "running" }}>
                    {row(true)}
                    {row(true)}
                </div>
            )}
        </div>
    )
}

addPropertyControls(NoireMarquee, {
    items: { type: ControlType.String, title: "Items (comma separated)", displayTextArea: true, defaultValue: "Identity, Exhibition, Editorial, Spatial, Digital archives, Art direction" },
    speed: { type: ControlType.Number, title: "Speed", min: 0, max: 90, defaultValue: 40 },
    size: { type: ControlType.Number, title: "Size", min: 24, max: 200, defaultValue: 72 },
    dark: { type: ControlType.Boolean, title: "Dark", defaultValue: false },
    italic: { type: ControlType.Boolean, title: "Alternate italic", defaultValue: true },
})
