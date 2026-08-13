"use client";

import { useCurrency } from "@/components/currency-context";

export function Money({ value, currency = "LKR", suffix = "total" }: { value: number; currency?: string; suffix?: string }) {
  const fx = useCurrency();
  const converted = fx.convert(value, currency);
  const changed = fx.currency !== currency;
  return <>
    <b>{fx.currency} {converted.toLocaleString(undefined, { maximumFractionDigits: changed ? 0 : 2 })}</b>
    <small>{changed ? `${suffix} · estimated · original ${currency} ${value.toLocaleString()}` : suffix}</small>
  </>;
}
