import { budgetRanges, projectTypes, timelines } from "@/content/site";

/** Shared contact-form schema — the same rules run in the browser and on the server. */
export type Enquiry = {
  name: string;
  email: string;
  company: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
};

export type EnquiryErrors = Partial<Record<keyof Enquiry, string>>;

export const emptyEnquiry: Enquiry = {
  name: "",
  email: "",
  company: "",
  projectType: "",
  budget: "",
  timeline: "",
  message: "",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateField(field: keyof Enquiry, value: string): string | undefined {
  const v = value.trim();
  switch (field) {
    case "name":
      if (!v) return "Please tell us your name.";
      if (v.length > 120) return "That name is a little long — 120 characters at most.";
      return;
    case "email":
      if (!v) return "We need an email address to reply.";
      if (!EMAIL.test(v))
        return "That email address doesn’t look complete — check for a missing @ or domain.";
      return;
    case "company":
      if (v.length > 160) return "Please keep this under 160 characters.";
      return;
    case "projectType":
      if (!v) return "Choose the option closest to your project.";
      if (!(projectTypes as readonly string[]).includes(v))
        return "Choose one of the listed project types.";
      return;
    case "budget":
      if (v && !(budgetRanges as readonly string[]).includes(v))
        return "Choose one of the listed ranges.";
      return;
    case "timeline":
      if (v && !(timelines as readonly string[]).includes(v))
        return "Choose one of the listed timelines.";
      return;
    case "message":
      if (v.length < 20) return "A few sentences help us reply properly — at least 20 characters.";
      if (v.length > 4000) return "Please keep the message under 4,000 characters.";
      return;
  }
}

export function validateEnquiry(data: Enquiry): EnquiryErrors {
  const errors: EnquiryErrors = {};
  (Object.keys(emptyEnquiry) as (keyof Enquiry)[]).forEach((k) => {
    const e = validateField(k, data[k] ?? "");
    if (e) errors[k] = e;
  });
  return errors;
}
