// NOIRÉ 2 — Contact (form + studio details).
// Visible labels, required markers, inline validation on blur, an error
// summary that receives focus, loading / success / error states, values kept
// after an error, a direct-email fallback and a quiet honeypot. Set "Form
// endpoint" to a form service URL (JSON POST); when empty the form opens the
// visitor's mail app with the enquiry prefilled instead of pretending to send.
import { addPropertyControls, ControlType } from "framer"
import { motion, useReducedMotion } from "framer-motion"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"

interface NoireContactProps {
    endpoint: string
    email: string
    availability: string
    location: string
    timeZone: string
    projectTypes: string
    budgets: string
    image?: { src: string; alt?: string }
    style?: CSSProperties
}

type Values = { name: string; email: string; company: string; type: string; budget: string; timeline: string; message: string }
type Errors = Partial<Record<keyof Values, string>>

const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'
const SERIF = '"Instrument Serif", "Times New Roman", serif'
const EASE = [0.16, 1, 0.3, 1] as const
const IMG = "https://raw.githubusercontent.com/uxuimonir/2nd/83430dfd2a7c2050799516849c47d8f2be688dc7/noire/public/media/"
const EMPTY: Values = { name: "", email: "", company: "", type: "", budget: "", timeline: "", message: "" }
const LABELS: Record<keyof Values, string> = { name: "Name", email: "Email", company: "Company / studio", type: "Project type", budget: "Budget range", timeline: "Timeline", message: "Message" }

function check(k: keyof Values, v: string): string | undefined {
    const t = v.trim()
    if (k === "name" && !t) return "Please tell us your name."
    if (k === "email") {
        if (!t) return "We need an email address to reply."
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return "That email address doesn’t look complete."
    }
    if (k === "type" && !t) return "Choose the option closest to your project."
    if (k === "message" && t.length < 20) return "A few sentences help us reply properly — at least 20 characters."
}

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
export default function NoireContact(props: NoireContactProps) {
    const {
        endpoint = "",
        email = "hello@noire.example",
        availability = "Booking projects from January 2027",
        location = "Lisbon, Portugal",
        timeZone = "Europe/Lisbon",
        projectTypes = "Identity, Exhibition, Editorial / book, Spatial, Digital, Art direction, Something else",
        budgets = "Under €15k, €15k – €40k, €40k – €80k, €80k +, Not sure yet",
        image = { src: IMG + "contact-studio.webp", alt: "" },
        style,
    } = props
    const root = useRef<HTMLDivElement>(null)
    const summary = useRef<HTMLDivElement>(null)
    const done = useRef<HTMLDivElement>(null)
    const hp = useRef<HTMLInputElement>(null)
    const w = useWidth(root)
    const reduce = useReducedMotion()
    const [v, setV] = useState<Values>(EMPTY)
    const [errors, setErrors] = useState<Errors>({})
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "mail" | "error">("idle")
    const [serverMsg, setServerMsg] = useState("")
    const [time, setTime] = useState("—:—")
    const compact = w < 900
    const pad = w < 600 ? 16 : w < 1200 ? 32 : 48
    const types = projectTypes.split(",").map((s) => s.trim()).filter(Boolean)
    const budgetList = budgets.split(",").map((s) => s.trim()).filter(Boolean)

    useEffect(() => {
        const f = () => {
            try {
                startTransition(() => setTime(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date())))
            } catch {}
        }
        f()
        const id = window.setInterval(f, 20000)
        return () => window.clearInterval(id)
    }, [timeZone])

    const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const val = e.target.value
        startTransition(() => {
            setV((p) => ({ ...p, [k]: val }))
            if (errors[k]) setErrors((p) => ({ ...p, [k]: check(k, val) }))
        })
    }
    const blur = (k: keyof Values) => () => startTransition(() => setErrors((p) => ({ ...p, [k]: check(k, v[k]) })))

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (status === "sending") return
        const found: Errors = {}
        ;(Object.keys(v) as (keyof Values)[]).forEach((k) => {
            const m = check(k, v[k])
            if (m) found[k] = m
        })
        startTransition(() => setErrors(found))
        if (Object.keys(found).length) {
            requestAnimationFrame(() => summary.current?.focus())
            return
        }
        if (hp.current?.value) return
        if (!endpoint) {
            const body = `${v.message}\n\n— ${v.name}${v.company ? `, ${v.company}` : ""}\nProject type: ${v.type}${v.budget ? `\nBudget: ${v.budget}` : ""}${v.timeline ? `\nTimeline: ${v.timeline}` : ""}`
            window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Project enquiry — ${v.type}`)}&body=${encodeURIComponent(body)}`
            startTransition(() => setStatus("mail"))
            requestAnimationFrame(() => done.current?.focus())
            return
        }
        startTransition(() => setStatus("sending"))
        try {
            const res = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json", accept: "application/json" }, body: JSON.stringify(v) })
            if (!res.ok) throw new Error(String(res.status))
            startTransition(() => setStatus("sent"))
            requestAnimationFrame(() => done.current?.focus())
        } catch {
            startTransition(() => {
                setServerMsg("Our form service didn’t respond, so your message wasn’t sent.")
                setStatus("error")
            })
            requestAnimationFrame(() => summary.current?.focus())
        }
    }

    const errList = (Object.keys(errors) as (keyof Values)[]).filter((k) => errors[k])
    const label: CSSProperties = { display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#11110F" }
    const input = (bad: boolean): CSSProperties => ({ width: "100%", minHeight: 52, padding: "12px 0", border: 0, borderBottom: `1px solid ${bad ? "#A8321F" : "#A9A49A"}`, borderRadius: 0, background: "transparent", color: "#11110F", fontFamily: SANS, fontSize: 19, outline: "none" })
    const err = (k: keyof Values) => (errors[k] ? <p id={`nc-${k}-err`} style={{ margin: "6px 0 0", fontFamily: SANS, fontSize: 13, color: "#A8321F" }}>— {errors[k]}</p> : null)
    const opt = <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#6D6A64" }}>Optional</span>
    const req = <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#6D6A64" }}>Required</span>

    const field = (k: keyof Values, type = "text", required = false, auto?: string) => (
        <div>
            <label htmlFor={`nc-${k}`} style={label}>
                <span>{LABELS[k]}</span>
                {required ? req : opt}
            </label>
            <input id={`nc-${k}`} name={k} type={type} autoComplete={auto} value={v[k]} onChange={set(k)} onBlur={blur(k)} required={required} aria-invalid={Boolean(errors[k])} aria-describedby={errors[k] ? `nc-${k}-err` : undefined} style={input(Boolean(errors[k]))} />
            {err(k)}
        </div>
    )

    const finished = status === "sent" || status === "mail"

    return (
        <section ref={root} aria-label="Project enquiry" style={{ ...style, width: "100%", background: "#F5F2EC", color: "#11110F", padding: `0 ${pad}px ${compact ? 96 : 160}px` }}>
            <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "minmax(0,1.7fr) minmax(0,1fr)", gap: compact ? 64 : 96, alignItems: "start" }}>
                {finished ? (
                    <motion.div ref={done} tabIndex={-1} role="status" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} style={{ padding: compact ? 28 : 48, borderRadius: 22, background: "#11110F", color: "#F7F5F0", outline: "none" }}>
                        <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: 56, height: 56, borderRadius: 99, background: "#D9573F", color: "#11110F", fontSize: 24 }}>✓</span>
                        <h2 style={{ margin: "28px 0 0", fontFamily: SERIF, fontWeight: 400, fontSize: compact ? 40 : 64, lineHeight: 1, letterSpacing: "-0.03em" }}>
                            {status === "sent" ? `Thank you, ${v.name.split(" ")[0]}.` : "Your email is ready."}
                        </h2>
                        <p style={{ margin: "18px 0 0", maxWidth: 520, fontFamily: SANS, fontSize: 18, lineHeight: 1.55, color: "#A5A199" }}>
                            {status === "sent" ? "Your enquiry is with us. We reply to every message within two working days." : "Your mail app should have opened with the enquiry filled in — just press send."} If anything went wrong, write to{" "}
                            <a href={`mailto:${email}`} style={{ color: "#F7F5F0" }}>{email}</a>.
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
                            <a href="/work" style={{ display: "inline-flex", alignItems: "center", height: 48, padding: "0 22px", borderRadius: 99, background: "#F7F5F0", color: "#11110F", textDecoration: "none", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>Browse the work →</a>
                            <a href="/" style={{ display: "inline-flex", alignItems: "center", height: 48, padding: "0 22px", borderRadius: 99, border: "1px solid #3a3833", color: "#F7F5F0", textDecoration: "none", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>Back home</a>
                        </div>
                    </motion.div>
                ) : (
                    <form onSubmit={submit} noValidate style={{ display: "grid", gap: 36 }}>
                        <div ref={summary} tabIndex={-1} aria-live="assertive" style={{ outline: "none" }}>
                            {status === "error" || errList.length > 1 ? (
                                <div role="alert" style={{ padding: 22, borderRadius: 14, background: "#EAE6DE", borderLeft: "3px solid #A8321F", fontFamily: SANS, fontSize: 15, lineHeight: 1.55 }}>
                                    <strong style={{ fontWeight: 600 }}>{status === "error" ? "Your message wasn’t sent." : "A few details need attention."}</strong>
                                    {status === "error" ? (
                                        <p style={{ margin: "6px 0 0" }}>
                                            {serverMsg} Everything you typed is still here — try again, or email <a href={`mailto:${email}`} style={{ color: "#11110F" }}>{email}</a>.
                                        </p>
                                    ) : null}
                                    {errList.length ? (
                                        <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                                            {errList.map((k) => (
                                                <li key={k}>
                                                    <a href={`#nc-${k === "type" ? "type-0" : k}`} style={{ color: "#11110F" }}>{LABELS[k]}: {errors[k]}</a>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "1fr 1fr", gap: 36 }}>
                            {field("name", "text", true, "name")}
                            {field("email", "email", true, "email")}
                        </div>
                        {field("company", "text", false, "organization")}
                        <fieldset aria-invalid={Boolean(errors.type)} aria-describedby={errors.type ? "nc-type-err" : undefined} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
                            <legend style={{ ...label, width: "100%", marginBottom: 14 }}>
                                <span>{LABELS.type}</span>
                                {req}
                            </legend>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {types.map((t, i) => {
                                    const on = v.type === t
                                    return (
                                        <label key={t} style={{ position: "relative" }}>
                                            <input id={`nc-type-${i}`} type="radio" name="type" value={t} checked={on} onChange={() => startTransition(() => { setV((p) => ({ ...p, type: t })); setErrors((p) => ({ ...p, type: undefined })) })} style={{ position: "absolute", inset: 0, opacity: 0, margin: 0, cursor: "pointer" }} />
                                            <span style={{ display: "inline-flex", alignItems: "center", minHeight: 44, padding: "0 18px", borderRadius: 99, border: `1px solid ${on ? "#11110F" : errors.type ? "#A8321F" : "#A9A49A"}`, background: on ? "#11110F" : "transparent", color: on ? "#F5F2EC" : "#11110F", fontFamily: SANS, fontSize: 14, transition: "background 200ms ease-out, color 200ms ease-out" }}>{t}</span>
                                        </label>
                                    )
                                })}
                            </div>
                            {err("type")}
                        </fieldset>
                        <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "1fr 1fr", gap: 36 }}>
                            <div>
                                <label htmlFor="nc-budget" style={label}>
                                    <span>{LABELS.budget}</span>
                                    {opt}
                                </label>
                                <select id="nc-budget" value={v.budget} onChange={set("budget")} style={{ ...input(false), appearance: "none" }}>
                                    <option value="">Select…</option>
                                    {budgetList.map((b) => (
                                        <option key={b}>{b}</option>
                                    ))}
                                </select>
                            </div>
                            {field("timeline", "text", false)}
                        </div>
                        <div>
                            <label htmlFor="nc-message" style={label}>
                                <span>{LABELS.message}</span>
                                {req}
                            </label>
                            <textarea id="nc-message" rows={6} value={v.message} onChange={set("message")} onBlur={blur("message")} required aria-invalid={Boolean(errors.message)} aria-describedby={`nc-message-hint${errors.message ? " nc-message-err" : ""}`} style={{ ...input(Boolean(errors.message)), minHeight: 160, resize: "vertical", lineHeight: 1.5 }} />
                            <p id="nc-message-hint" style={{ margin: "6px 0 0", fontFamily: SANS, fontSize: 13, color: "#6D6A64" }}>What are you making, who is it for, and what does success look like?</p>
                            {err("message")}
                        </div>
                        <div aria-hidden="true" style={{ position: "absolute", left: -10000, width: 1, height: 1, overflow: "hidden" }}>
                            <label htmlFor="nc-website">Website</label>
                            <input ref={hp} id="nc-website" tabIndex={-1} autoComplete="off" />
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
                            <p style={{ margin: 0, maxWidth: 360, fontFamily: SANS, fontSize: 13, color: "#6D6A64" }}>
                                Prefer email? <a href={`mailto:${email}`} style={{ color: "#11110F" }}>{email}</a> — we reply within two working days.
                            </p>
                            <button type="submit" disabled={status === "sending"} style={{ display: "inline-flex", alignItems: "center", gap: 14, height: 56, padding: "0 8px 0 26px", border: 0, borderRadius: 99, background: "#11110F", color: "#F7F5F0", fontFamily: SANS, fontSize: 13, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", cursor: status === "sending" ? "progress" : "pointer", opacity: status === "sending" ? 0.7 : 1 }}>
                                {status === "sending" ? "Sending…" : "Send enquiry"}
                                <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 99, background: "#D9573F", color: "#11110F" }}>→</span>
                            </button>
                        </div>
                    </form>
                )}
                <aside aria-label="Studio details" style={{ display: "grid", gap: 28, ...(compact ? {} : { position: "sticky", top: 110 }) }}>
                    {image?.src ? (
                        <div style={{ aspectRatio: "4 / 3", borderRadius: 18, overflow: "hidden", background: "#EAE6DE" }}>
                            <img src={image.src} alt={image.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                    ) : null}
                    <dl style={{ display: "grid", gap: 22, margin: 0, fontFamily: SANS, fontSize: 16 }}>
                        {[
                            ["Availability", <span key="a" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 99, background: "#D9573F" }} />{availability}</span>],
                            ["Studio", `${location} — local time ${time}`],
                            ["Email", <a key="e" href={`mailto:${email}`} style={{ color: "#11110F" }}>{email}</a>],
                        ].map(([k, val]) => (
                            <div key={String(k)}>
                                <dt style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6D6A64", marginBottom: 6 }}>{k}</dt>
                                <dd style={{ margin: 0 }}>{val}</dd>
                            </div>
                        ))}
                    </dl>
                </aside>
            </div>
        </section>
    )
}

addPropertyControls(NoireContact, {
    endpoint: { type: ControlType.String, title: "Form endpoint (POST JSON)", defaultValue: "" },
    email: { type: ControlType.String, title: "Email", defaultValue: "hello@noire.example" },
    availability: { type: ControlType.String, title: "Availability", defaultValue: "Booking projects from January 2027" },
    location: { type: ControlType.String, title: "Location", defaultValue: "Lisbon, Portugal" },
    timeZone: { type: ControlType.String, title: "Time zone", defaultValue: "Europe/Lisbon" },
    projectTypes: { type: ControlType.String, title: "Project types", displayTextArea: true, defaultValue: "Identity, Exhibition, Editorial / book, Spatial, Digital, Art direction, Something else" },
    budgets: { type: ControlType.String, title: "Budget ranges", displayTextArea: true, defaultValue: "Under €15k, €15k – €40k, €40k – €80k, €80k +, Not sure yet" },
    image: { type: ControlType.ResponsiveImage, title: "Image" },
})
