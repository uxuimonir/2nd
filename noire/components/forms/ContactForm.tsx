"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { budgetRanges, projectTypes, site, timelines } from "@/content/site";
import {
  emptyEnquiry,
  validateEnquiry,
  validateField,
  type Enquiry,
  type EnquiryErrors,
} from "@/lib/contact";

type Status = "idle" | "submitting" | "success" | "error";

const LABELS: Record<keyof Enquiry, string> = {
  name: "Name",
  email: "Email",
  company: "Company / studio",
  projectType: "Project type",
  budget: "Budget range",
  timeline: "Timeline",
  message: "Message",
};

/**
 * Contact form — visible labels, inline validation on blur, error summary on
 * submit, loading/success/error states, values preserved after an error and
 * a direct email fallback throughout.
 */
export function ContactForm() {
  const [values, setValues] = useState<Enquiry>(emptyEnquiry);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Enquiry, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const summary = useRef<HTMLDivElement>(null);
  const success = useRef<HTMLDivElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  const set =
    (field: keyof Enquiry) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setValues((v) => ({ ...v, [field]: value }));
      if (touched[field] || errors[field])
        setErrors((er) => ({ ...er, [field]: validateField(field, value) }));
    };

  const blur = (field: keyof Enquiry) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((er) => ({ ...er, [field]: validateField(field, values[field]) }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    const found = validateEnquiry(values);
    setErrors(found);
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
    if (Object.keys(found).length) {
      setStatus("idle");
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    setStatus("submitting");
    setServerMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, website: honeypot.current?.value ?? "" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        errors?: EnquiryErrors;
      };
      if (res.ok && data.ok) {
        setStatus("success");
        requestAnimationFrame(() => success.current?.focus());
        return;
      }
      if (data.errors) setErrors(data.errors);
      setServerMessage(data.message ?? "Something went wrong on our side.");
      setStatus("error");
      requestAnimationFrame(() => summary.current?.focus());
    } catch {
      setServerMessage("We couldn’t reach the server — you might be offline.");
      setStatus("error");
      requestAnimationFrame(() => summary.current?.focus());
    }
  };

  const errorList = (Object.keys(errors) as (keyof Enquiry)[]).filter((k) => errors[k]);
  const describedBy = (f: keyof Enquiry, hint?: boolean) =>
    [hint ? `${f}-hint` : null, errors[f] ? `${f}-error` : null].filter(Boolean).join(" ") ||
    undefined;

  if (status === "success") {
    return (
      <div className="form-success" ref={success} tabIndex={-1} role="status" aria-live="polite">
        <span className="form-success__mark" aria-hidden="true">
          ✓
        </span>
        <h2 className="t-h1">Thank you, {values.name.split(" ")[0]}.</h2>
        <p className="t-body-l t-muted" style={{ marginTop: "var(--space-4)", maxWidth: "32em" }}>
          Your enquiry is with us. We reply to every message within two working days, usually
          sooner. If it’s urgent, write directly to{" "}
          <a className="link-underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          .
        </p>
        <div className="form-success__actions">
          <Link className="btn btn--primary" href="/work">
            Browse the work{" "}
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </Link>
          <Link className="btn btn--secondary" href="/">
            Back home
          </Link>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              setValues(emptyEnquiry);
              setErrors({});
              setTouched({});
              setStatus("idle");
            }}
          >
            Send another enquiry
          </button>
        </div>
      </div>
    );
  }

  const field = (
    f: keyof Enquiry,
    opts: {
      type?: string;
      required?: boolean;
      autoComplete?: string;
      placeholder?: string;
      hint?: string;
    },
  ) => (
    <div className="field">
      <label className="field__label" htmlFor={f}>
        <span>{LABELS[f]}</span>
        {opts.required ? (
          <span className="field__req">Required</span>
        ) : (
          <span className="field__opt">Optional</span>
        )}
      </label>
      <input
        id={f}
        name={f}
        className="field__input"
        type={opts.type ?? "text"}
        value={values[f]}
        onChange={set(f)}
        onBlur={blur(f)}
        required={opts.required}
        aria-required={opts.required}
        aria-invalid={Boolean(errors[f])}
        aria-describedby={describedBy(f, Boolean(opts.hint))}
        autoComplete={opts.autoComplete}
        placeholder={opts.placeholder}
      />
      {opts.hint ? (
        <p id={`${f}-hint`} className="field__hint">
          {opts.hint}
        </p>
      ) : null}
      {errors[f] ? (
        <p id={`${f}-error`} className="field__error">
          {errors[f]}
        </p>
      ) : null}
    </div>
  );

  return (
    <form className="form" onSubmit={onSubmit} noValidate aria-describedby="form-note">
      <div ref={summary} tabIndex={-1} aria-live="assertive">
        {status === "error" || errorList.length > 1 ? (
          <div className="form-alert" role="alert">
            <h2>
              {status === "error" ? "Your message wasn’t sent" : "A few details need attention"}
            </h2>
            {status === "error" ? (
              <p>
                {serverMessage} Everything you typed is still here — try again, or email us directly
                at <a href={`mailto:${site.email}`}>{site.email}</a>.
              </p>
            ) : null}
            {errorList.length ? (
              <ul>
                {errorList.map((k) => (
                  <li key={k}>
                    <a href={`#${k === "projectType" ? "projectType-0" : k}`}>
                      {LABELS[k]}: {errors[k]}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="form__row form__row--2">
        {field("name", { required: true, autoComplete: "name" })}
        {field("email", {
          required: true,
          type: "email",
          autoComplete: "email",
          hint: "We’ll only use it to reply.",
        })}
      </div>
      {field("company", { autoComplete: "organization" })}

      <fieldset
        className="choice-group"
        aria-invalid={Boolean(errors.projectType)}
        aria-describedby={errors.projectType ? "projectType-error" : undefined}
      >
        <legend className="field__label" style={{ width: "100%" }}>
          <span>{LABELS.projectType}</span>
          <span className="field__req">Required</span>
        </legend>
        <div className="choice-group__options">
          {projectTypes.map((t, i) => (
            <label key={t} className="choice">
              <input
                id={`projectType-${i}`}
                type="radio"
                name="projectType"
                value={t}
                checked={values.projectType === t}
                onChange={(e) => {
                  setValues((v) => ({ ...v, projectType: e.target.value }));
                  setErrors((er) => ({ ...er, projectType: undefined }));
                }}
                required
              />
              <span>{t}</span>
            </label>
          ))}
        </div>
        {errors.projectType ? (
          <p
            id="projectType-error"
            className="field__error"
            style={{ marginTop: "var(--space-2)" }}
          >
            {errors.projectType}
          </p>
        ) : null}
      </fieldset>

      <div className="form__row form__row--2">
        {(["budget", "timeline"] as const).map((f) => (
          <div className="field" key={f}>
            <label className="field__label" htmlFor={f}>
              <span>{LABELS[f]}</span>
              <span className="field__opt">Optional</span>
            </label>
            <select
              id={f}
              name={f}
              className="field__input"
              value={values[f]}
              onChange={set(f)}
              onBlur={blur(f)}
              aria-invalid={Boolean(errors[f])}
            >
              <option value="">Select…</option>
              {(f === "budget" ? budgetRanges : timelines).map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="message">
          <span>{LABELS.message}</span>
          <span className="field__req">Required</span>
        </label>
        <textarea
          id="message"
          name="message"
          className="field__input"
          value={values.message}
          onChange={set("message")}
          onBlur={blur("message")}
          required
          aria-required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy("message", true)}
          rows={6}
        />
        <p id="message-hint" className="field__hint">
          What are you making, who is it for, and what does success look like?
        </p>
        {errors.message ? (
          <p id="message-error" className="field__error">
            {errors.message}
          </p>
        ) : null}
      </div>

      {/* Spam honeypot — hidden from people and assistive tech */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          ref={honeypot}
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="form__footer">
        <p id="form-note" className="form__note">
          Prefer email? Write to{" "}
          <a className="link-underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          . We reply within two working days.
        </p>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={status === "submitting"}
          aria-disabled={status === "submitting"}
        >
          {status === "submitting" ? (
            <>
              <span className="spinner" aria-hidden="true" /> Sending…
            </>
          ) : (
            <>
              Send enquiry{" "}
              <span className="btn__arrow" aria-hidden="true">
                →
              </span>
            </>
          )}
        </button>
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">
        {status === "submitting" ? "Sending your enquiry" : ""}
      </p>
    </form>
  );
}
