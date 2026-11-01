// Invisible human checks sent with every public enquiry. Visitors never see or
// solve anything. Field names must match shared/bot-check.ts in the TravelOS
// repository (the public-travel-api Edge Function enforces them).
export const BOT_TRAP_FIELD = "website_url";
export const FORM_STARTED_FIELD = "form_started_at";

// When this page's code first ran: a person needs seconds to fill a form,
// an automated submitter usually needs milliseconds.
const pageStartedAt = typeof window === "undefined" ? 0 : Date.now();

type TrapRoot = { querySelectorAll(selector: string): ArrayLike<{ value: string }> };

export function botSignals(root: TrapRoot | null = typeof document === "undefined" ? null : document, startedAt = pageStartedAt) {
  const filled = root ? Array.from(root.querySelectorAll(`input[name="${BOT_TRAP_FIELD}"]`)).find(input => input.value.trim() !== "") : undefined;
  return { [BOT_TRAP_FIELD]: filled?.value ?? "", [FORM_STARTED_FIELD]: startedAt };
}
