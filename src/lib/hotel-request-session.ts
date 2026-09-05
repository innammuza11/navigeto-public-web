type Storage = Pick<globalThis.Storage, "getItem" | "setItem" | "removeItem">;
export type BookingReceipt = { booking: { public_ref: string; total_amount: number; currency: string } };
type Pending = { id: string; fingerprint: string; receipt?: BookingReceipt };
export const HOTEL_REQUEST_STORAGE = "navigeto:hotel-request:v1";
const fields = ["rate_id", "checkin", "checkout", "rooms", "adults", "children", "occupancy", "customer_name", "customer_email", "customer_whatsapp", "nationality", "special_requests"];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function receipt(value: unknown): BookingReceipt {
  const booking = (value as BookingReceipt)?.booking;
  if (!booking || typeof booking.public_ref !== "string" || !booking.public_ref || typeof booking.total_amount !== "number" || !Number.isFinite(booking.total_amount) || typeof booking.currency !== "string") throw new Error("We could not confirm the response. Retry with the same details.");
  return { booking: { public_ref: booking.public_ref, total_amount: booking.total_amount, currency: booking.currency } };
}

/** One explicit booking intent per tab. Storage contains no contacts or raw form data. */
export class HotelRequestSession {
  private busy = false;
  private storage: () => Storage;
  constructor(storage: () => Storage) { this.storage = storage; }

  private read(): Pending | null {
    try {
      const raw = this.storage().getItem(HOTEL_REQUEST_STORAGE);
      if (raw === null) return null;
      const value = JSON.parse(raw) as Pending;
      if (!uuid.test(value.id) || !/^[a-f0-9]{64}$/.test(value.fingerprint)) throw new Error("Invalid recovery data");
      if (value.receipt) value.receipt = receipt(value.receipt);
      return value;
    } catch { throw new Error("Booking recovery storage is unavailable or invalid. Enable browser storage, or contact Navigeto before starting a separate request."); }
  }

  startSeparateRequest() {
    if (this.busy) throw new Error("Please wait for the current request to finish.");
    this.storage().removeItem(HOTEL_REQUEST_STORAGE);
    if (this.storage().getItem(HOTEL_REQUEST_STORAGE) !== null) throw new Error("Could not reset booking recovery storage.");
  }

  async submit(payload: Record<string, unknown>, validateNew: () => void, send: (payload: Record<string, unknown>) => Promise<BookingReceipt>) {
    if (this.busy) throw new Error("Your request is already being sent.");
    this.busy = true;
    try {
      const canonical = JSON.stringify(Object.fromEntries(fields.map(key => [key, payload[key] ?? null])));
      const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
      const fingerprint = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
      let pending = this.read();
      if (pending && pending.fingerprint !== fingerprint) throw new Error("An earlier hotel request has different details. Restore those details to retry, or explicitly start a separate request. The earlier request may already have been received.");
      if (pending?.receipt) return pending.receipt;
      if (!pending) {
        validateNew();
        pending = { id: crypto.randomUUID(), fingerprint };
        try {
          this.storage().setItem(HOTEL_REQUEST_STORAGE, JSON.stringify(pending));
          if (this.storage().getItem(HOTEL_REQUEST_STORAGE) !== JSON.stringify(pending)) throw new Error("Storage write failed");
        } catch { throw new Error("Enable browser storage before submitting so this booking can be retried safely."); }
      }
      // A pending retry bypasses only client date freshness checks. Server validates
      // any uncommitted request; a committed receipt remains recoverable after midnight.
      const result = receipt(await send({ ...payload, request_id: pending.id }));
      // The persisted pending key is already sufficient for a safe retry if this
      // optional success-cache write fails (for example a storage quota change).
      try { this.storage().setItem(HOTEL_REQUEST_STORAGE, JSON.stringify({ ...pending, receipt: result })); } catch { /* keep original pending identity */ }
      return result;
    } finally { this.busy = false; }
  }
}
