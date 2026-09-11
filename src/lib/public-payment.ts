export type PublicPaymentOption = {
  id: string;
  label: string;
  amount: number;
  currency: "LKR" | "USD";
};

export type PublicPaymentLink = {
  payUrl: string;
  expiresAt: string;
  environment: "production";
  reused: boolean;
};

export function isTrustedProductionMarxUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "marx.lk" || url.hostname.endsWith(".marx.lk"));
  } catch {
    return false;
  }
}
