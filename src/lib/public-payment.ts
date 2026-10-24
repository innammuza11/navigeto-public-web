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
    return (
      !url.username &&
      !url.password &&
      (!url.port || url.port === "443") &&
      url.protocol === "https:" &&
      (url.hostname === "marx.lk" || url.hostname.endsWith(".marx.lk"))
    );
  } catch {
    return false;
  }
}

export type OnlineBookingSummary = {
  reference: string;
  reservationReference: string | null;
  service: string;
  status: string;
  travelStart: string | null;
  travelEnd: string | null;
  total: number | null;
  currency: string | null;
  terms: string | null;
  checkoutExpiresAt: string | null;
  payable: boolean;
  changeRequests: Array<{
    type: string;
    status: string;
    outcome: string | null;
    createdAt: string;
  }>;
  payments: Array<{
    id: string;
    label: string;
    amount: number;
    currency: string;
    status: string;
    canPay: boolean;
  }>;
};

export function bookingStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Awaiting availability review",
    contacted: "Your request is being reviewed",
    confirmed: "Booking confirmed",
    payment_pending: "Payment due",
    partially_paid: "Part payment recorded",
    fully_paid: "Payment recorded",
    received: "Payment received · finance posting pending",
    posted: "Receipt posted",
    review: "Payment under review",
    confirming: "Payment confirmation pending",
    awaiting_payment: "Ready to pay",
    cancelled: "Cancelled",
    expired: "Expired",
  };
  return labels[status] || status.replace(/_/g, " ");
}
