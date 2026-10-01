import { emptyEnquiry, validateEnquiry, type Enquiry } from "@/lib/contact";

/**
 * Contact form destination. Validates server-side with the same schema as the
 * browser. Set CONTACT_WEBHOOK_URL to forward enquiries (form service, Slack,
 * Zapier, your CRM …); without it, enquiries are logged on the server.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: "The request could not be read." }, { status: 400 });
  }

  // Honeypot: real people never see this field.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return Response.json({ ok: true });
  }

  const data = Object.fromEntries(
    (Object.keys(emptyEnquiry) as (keyof Enquiry)[]).map((k) => [
      k,
      typeof body[k] === "string" ? (body[k] as string).trim() : "",
    ]),
  ) as Enquiry;
  const errors = validateEnquiry(data);
  if (Object.keys(errors).length) {
    return Response.json(
      { ok: false, message: "Some fields need attention.", errors },
      { status: 422 },
    );
  }

  const destination = process.env.CONTACT_WEBHOOK_URL;
  if (destination) {
    try {
      const res = await fetch(destination, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, receivedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error(`Destination responded ${res.status}`);
    } catch (error) {
      console.error("[contact] forwarding failed", error);
      return Response.json(
        { ok: false, message: "Our form service didn’t respond, so your message wasn’t sent." },
        { status: 502 },
      );
    }
  } else {
    console.info("[contact] enquiry received (set CONTACT_WEBHOOK_URL to forward):", {
      ...data,
      message: `${data.message.slice(0, 80)}…`,
    });
  }

  return Response.json({ ok: true });
}
