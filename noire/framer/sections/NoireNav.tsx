// NOIRÉ 2 — Nav / Desktop + Nav / Mobile.
// Fixed micro header: transparent with light type over a dark hero, then a
// blurred cream bar once the hero has scrolled away ("Over dark" off = always cream),
// with a live studio clock and a full-screen mobile menu that traps focus and
// closes on Escape. In Framer: place it at the top of each page and set the
// instance position to Fixed, top 0, width 100%.
import { addPropertyControls, ControlType } from "framer"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

type NavLink = { label: string; link: string }

interface NoireNavProps {
    wordmark: string
    links: NavLink[]
    status: string
    city: string
    timeZone: string
    email: string
    overDark: boolean
    style?: CSSProperties
}

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'
const EASE = [0.16, 1, 0.3, 1] as const

function useWidth(ref: React.RefObject<HTMLElement | null>) {
    const [w, setW] = useState(1200)
    useEffect(() => {
        if (!ref.current || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver((e) => startTransition(() => setW((e[0].target as HTMLElement).getBoundingClientRect().width)))
        ro.observe(ref.current)
        return () => ro.disconnect()
    }, [])
    return w
}

function useClock(timeZone: string) {
    const [t, setT] = useState("—:—")
    useEffect(() => {
        const f = () => {
            try {
                startTransition(() => setT(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date())))
            } catch {}
        }
        f()
        const id = window.setInterval(f, 20000)
        return () => window.clearInterval(id)
    }, [timeZone])
    return t
}

const DEFAULT_LINKS: NavLink[] = [
    { label: "Work", link: "/work" },
    { label: "About", link: "/about" },
    { label: "Services", link: "/services" },
    { label: "Journal", link: "/journal" },
    { label: "Contact", link: "/contact" },
]

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function NoireNav(props: NoireNavProps) {
    const { wordmark = "NOIRÉ", links = DEFAULT_LINKS, status = "Booking from January 2027", city = "Lisbon", timeZone = "Europe/Lisbon", email = "hello@noire.example", overDark = true, style } = props
    const root = useRef<HTMLDivElement>(null)
    const w = useWidth(root)
    const time = useClock(timeZone)
    const [open, setOpen] = useState(false)
    const menuBtn = useRef<HTMLButtonElement>(null)
    const panel = useRef<HTMLDivElement>(null)
    const reduce = useReducedMotion()
    const [scrolled, setScrolled] = useState(false)
    useEffect(() => {
        if (typeof window === "undefined") return
        const on = () => startTransition(() => setScrolled(window.scrollY > window.innerHeight * 0.8))
        on()
        window.addEventListener("scroll", on, { passive: true })
        return () => window.removeEventListener("scroll", on)
    }, [])
    const light = !overDark || scrolled
    const ink = light ? "#11110F" : "#F7F5F0"
    const compact = w < 900
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48

    useEffect(() => {
        if (!open || typeof document === "undefined") return
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        const items = () => Array.from(panel.current?.querySelectorAll<HTMLElement>("a,button") ?? [])
        items()[0]?.focus()
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close()
            if (e.key === "Tab") {
                const list = items()
                if (!list.length) return
                if (e.shiftKey && document.activeElement === list[0]) {
                    e.preventDefault()
                    list[list.length - 1].focus()
                } else if (!e.shiftKey && document.activeElement === list[list.length - 1]) {
                    e.preventDefault()
                    list[0].focus()
                }
            }
        }
        document.addEventListener("keydown", onKey)
        return () => {
            document.body.style.overflow = prev
            document.removeEventListener("keydown", onKey)
        }
    }, [open])

    const close = () => {
        startTransition(() => setOpen(false))
        menuBtn.current?.focus()
    }

    const label: CSSProperties = { fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: ink, textDecoration: "none" }

    return (
        <div ref={root} style={{ ...style, position: "relative", width: "100%" }}>
            <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, height: 72, padding: `0 ${pad}px`, color: ink, background: light ? "rgba(245,242,236,0.86)" : "transparent", backdropFilter: light ? "blur(14px) saturate(1.2)" : "none", WebkitBackdropFilter: light ? "blur(14px) saturate(1.2)" : "none", borderBottom: `1px solid ${light ? "rgba(17,17,15,0.08)" : "transparent"}`, transition: "background 320ms ease-out, color 320ms ease-out, border-color 320ms ease-out" }}>
                <a href="/" aria-label={`${wordmark} — home`} style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 1, color: ink, textDecoration: "none", letterSpacing: "0.01em" }}>
                    {wordmark}
                </a>
                {!compact ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 20, fontFamily: SANS, fontSize: 13, color: ink, opacity: 0.75 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 99, background: "#D9573F" }} />
                            {status}
                        </span>
                        <span style={{ fontVariantNumeric: "tabular-nums" }}>
                            {city} {time}
                        </span>
                    </div>
                ) : null}
                {!compact ? (
                    <nav aria-label="Primary">
                        <ul role="list" style={{ display: "flex", gap: 28, listStyle: "none", margin: 0, padding: 0 }}>
                            {links.map((l) => (
                                <li key={l.label}>
                                    <a href={l.link} style={{ ...label, display: "inline-block", padding: "14px 0" }}>
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                ) : (
                    <button ref={menuBtn} type="button" aria-expanded={open} aria-controls="noire-menu" onClick={() => startTransition(() => setOpen(true))} style={{ ...label, display: "inline-flex", alignItems: "center", gap: 10, minHeight: 44, padding: "0 4px", background: "none", border: 0, cursor: "pointer" }}>
                        Menu
                        <span aria-hidden="true" style={{ display: "grid", gap: 5 }}>
                            <span style={{ display: "block", width: 20, height: 1.5, background: ink }} />
                            <span style={{ display: "block", width: 20, height: 1.5, background: ink }} />
                        </span>
                    </button>
                )}
            </header>
            <AnimatePresence>
                {open ? (
                    <motion.div
                        id="noire-menu"
                        ref={panel}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Site menu"
                        initial={{ clipPath: "inset(0 0 100% 0)" }}
                        animate={{ clipPath: "inset(0 0 0% 0)" }}
                        exit={{ clipPath: "inset(0 0 100% 0)" }}
                        transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
                        style={{ position: "fixed", inset: 0, zIndex: 100, background: "#11110F", color: "#F7F5F0", display: "flex", flexDirection: "column", padding: `0 ${pad}px 32px`, overflowY: "auto" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
                            <a href="/" style={{ fontFamily: SERIF, fontSize: 28, color: "#F7F5F0", textDecoration: "none" }} onClick={close}>
                                {wordmark}
                            </a>
                            <button type="button" onClick={close} style={{ ...label, color: "#F7F5F0", minHeight: 44, background: "none", border: 0, cursor: "pointer" }}>
                                Close
                            </button>
                        </div>
                        <nav aria-label="Mobile" style={{ flex: 1, display: "flex", alignItems: "center" }}>
                            <ul role="list" style={{ listStyle: "none", margin: 0, padding: 0, width: "100%" }}>
                                {[{ label: "Home", link: "/" }, ...links].map((l, i) => (
                                    <motion.li key={l.label} initial={{ opacity: 0, y: reduce ? 0 : 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 0.15 + i * 0.05, duration: 0.6, ease: EASE }} style={{ borderBottom: "1px solid #2a2925" }}>
                                        <a href={l.link} onClick={close} style={{ display: "flex", alignItems: "baseline", gap: 16, padding: "10px 0", color: "#F7F5F0", textDecoration: "none", fontFamily: SERIF, fontSize: "clamp(44px, 11vw, 72px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                                            <span style={{ fontFamily: SANS, fontSize: 12, color: "#A5A199", minWidth: 24 }}>{String(i + 1).padStart(2, "0")}</span>
                                            {l.label}
                                        </a>
                                    </motion.li>
                                ))}
                            </ul>
                        </nav>
                        <div style={{ display: "grid", gap: 8, paddingTop: 24, fontFamily: SANS, fontSize: 15, color: "#A5A199" }}>
                            <span>{status}</span>
                            <a href={`mailto:${email}`} style={{ color: "#F7F5F0", fontSize: 20, textDecoration: "none" }}>
                                {email}
                            </a>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    )
}

addPropertyControls(NoireNav, {
    wordmark: { type: ControlType.String, title: "Wordmark", defaultValue: "NOIRÉ" },
    links: {
        type: ControlType.Array,
        title: "Links",
        control: { type: ControlType.Object, controls: { label: { type: ControlType.String, title: "Label" }, link: { type: ControlType.Link, title: "Link" } } },
        defaultValue: DEFAULT_LINKS,
    },
    status: { type: ControlType.String, title: "Status", defaultValue: "Booking from January 2027" },
    city: { type: ControlType.String, title: "City", defaultValue: "Lisbon" },
    timeZone: { type: ControlType.String, title: "Time zone", defaultValue: "Europe/Lisbon" },
    email: { type: ControlType.String, title: "Email", defaultValue: "hello@noire.example" },
    overDark: { type: ControlType.Boolean, title: "Over dark hero", defaultValue: true },
})
