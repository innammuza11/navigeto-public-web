export const DEMO_WHATSAPP = "https://wa.me/94753310101?text=Hi%20Navigeto%2C%20I%27d%20like%20a%20TravelOS%20demo%20for%20my%20travel%20agency.";

export function demoRequestPayload(form: FormData, search: string) {
  const field = (name: string, max: number) => String(form.get(name) || "").trim().slice(0, max);
  const name = field("name", 160), agency = field("agency", 160);
  const email = field("email", 200), phone = field("phone", 40);
  const goal = field("goal", 100);
  if (name.length < 2 || agency.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\+?[\d\s().-]{7,40}$/.test(phone) || phone.replace(/\D/g, "").length < 7) {
    throw new Error("Please add your name, agency, work email and a valid WhatsApp number with country code.");
  }
  if (form.get("consent") !== "on") throw new Error("Please allow us to contact you about your demo.");
  const params = new URLSearchParams(search);
  // Campaign labels only; never retain the URL, arbitrary query parameters or referrer.
  const campaign = Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "utm_content"].flatMap(key => {
    const value = params.get(key);
    return value && /^[a-zA-Z0-9_-]{1,100}$/.test(value) ? [[key, value]] : [];
  }));
  return {
    enquiry_type: "general", customer_name: name, email, whatsapp: phone,
    subject: `TravelOS agency demo — ${agency}`,
    notes: `Software demo request. Agency: ${agency}. Focus: ${goal || "Complete workflow"}. This is not a travel booking.`,
    consent_contact: true,
    details: { product: "travelos", request_kind: "agency_software_demo", agency_name: agency, focus: goal, source_page: "/travelos", campaign },
  };
}
