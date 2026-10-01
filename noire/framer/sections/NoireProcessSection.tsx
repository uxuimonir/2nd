// NOIRÉ 2 — Process.
// Frame → Explore → Shape → Deliver. Scroll progress fills a vertical rule
// and highlights the current step; content is never hidden. Wide layouts pin
// the large step number beside the list.
import { addPropertyControls, ControlType } from "framer"
import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

type Step = { number: string; title: string; text: string }

interface NoireProcessSectionProps {
    label: string
    heading: string
    headingItalic: string
    steps: Step[]
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'

const DEFAULT_STEPS: Step[] = [
    { number: "01", title: "Frame", text: "We listen, read and visit. The outcome is a one-page brief we agree on together — including what we will not do." },
    { number: "02", title: "Explore", text: "Several honest directions, tested on real content and real materials rather than mood boards." },
    { number: "03", title: "Shape", text: "One direction, refined in detail. Systems, prototypes, samples and the hard decisions about what stays." },
    { number: "04", title: "Deliver", text: "Production, press checks and handover. We stay close until the last sign is installed or the last page printed." },
]

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
export default function NoireProcessSection(props: NoireProcessSectionProps) {
    const { label = "Process", heading = "Four steps,", headingItalic = "no shortcuts.", steps = DEFAULT_STEPS, style } = props
    const root = useRef<HTMLDivElement>(null)
    const list = useRef<HTMLOListElement>(null)
    const w = useWidth(root)
    const compact = w < 900
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const { scrollYProgress } = useScroll({ target: list, offset: ["start 0.6", "end 0.6"] })
    const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })
    const scaleY = useTransform(fill, [0, 1], [0, 1])
    const [active, setActive] = useState(0)

    useEffect(() => scrollYProgress.on("change", (v) => startTransition(() => setActive(Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length + 0.0001)))))), [scrollYProgress, steps.length])

    const current = steps[active] ?? steps[0]

    return (
        <section ref={root} aria-labelledby="noire-process" style={{ ...style, width: "100%", background: "#F5F2EC", color: "#11110F", padding: `${compact ? 96 : 160}px ${pad}px` }}>
            <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "minmax(0,5fr) minmax(0,7fr)", gap: compact ? 48 : 64, alignItems: "start" }}>
                <div style={compact ? undefined : { position: "sticky", top: 120 }}>
                    <p style={{ margin: "0 0 20px", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6D6A64", display: "flex", alignItems: "center", gap: 10 }}>
                        <span aria-hidden="true" style={{ width: 28, height: 1, background: "#D9573F" }} />
                        {label}
                    </p>
                    <h2 id="noire-process" style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: compact ? 48 : 88, lineHeight: 0.96, letterSpacing: "-0.03em" }}>
                        {heading} <em style={{ color: "#D9573F" }}>{headingItalic}</em>
                    </h2>
                    {!compact ? (
                        <div aria-hidden="true" style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 56 }}>
                            <span style={{ fontFamily: SERIF, fontSize: 200, lineHeight: 0.8, letterSpacing: "-0.05em", color: "#11110F" }}>{current?.number}</span>
                            <span style={{ fontFamily: SANS, fontSize: 13, color: "#6D6A64" }}>/ {String(steps.length).padStart(2, "0")} — {current?.title}</span>
                        </div>
                    ) : null}
                </div>
                <div style={{ position: "relative", paddingLeft: compact ? 24 : 40 }}>
                    <div aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 1, background: "#D3CFC6" }}>
                        <motion.div style={{ position: "absolute", inset: 0, background: "#D9573F", transformOrigin: "top", scaleY }} />
                    </div>
                    <ol ref={list} role="list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                        {steps.map((s, i) => (
                            <li key={s.number + i} style={{ minHeight: compact ? undefined : "38vh", padding: compact ? "24px 0" : "40px 0", display: "grid", alignContent: "center", opacity: i === active ? 1 : 0.35, transition: "opacity 480ms cubic-bezier(.22,.61,.36,1)" }}>
                                <span style={{ fontFamily: SANS, fontSize: 13, color: "#6D6A64" }}>{s.number}</span>
                                <h3 style={{ margin: "10px 0 0", fontFamily: SERIF, fontWeight: 400, fontSize: compact ? 44 : 72, lineHeight: 1, letterSpacing: "-0.025em" }}>{s.title}</h3>
                                <p style={{ margin: "14px 0 0", maxWidth: 520, fontFamily: SANS, fontSize: 18, lineHeight: 1.55, color: "#6D6A64" }}>{s.text}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    )
}

addPropertyControls(NoireProcessSection, {
    label: { type: ControlType.String, title: "Label", defaultValue: "Process" },
    heading: { type: ControlType.String, title: "Heading", defaultValue: "Four steps," },
    headingItalic: { type: ControlType.String, title: "Heading italic", defaultValue: "no shortcuts." },
    steps: {
        type: ControlType.Array,
        title: "Steps",
        control: { type: ControlType.Object, controls: { number: { type: ControlType.String, title: "Number" }, title: { type: ControlType.String, title: "Title" }, text: { type: ControlType.String, title: "Text", displayTextArea: true } } },
        defaultValue: DEFAULT_STEPS,
    },
})
