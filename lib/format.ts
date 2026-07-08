export function formatMoney(value: number | null | undefined, currency = "USD") {
  if (value == null || !Number.isFinite(Number(value))) return "Price on request";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value));
  } catch {
    return `${currency} ${Number(value).toFixed(0)}`;
  }
}

export function whatsappUrl(number: string, message: string) {
  const clean = String(number || "").replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
