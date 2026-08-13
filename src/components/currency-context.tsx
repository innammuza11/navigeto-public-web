"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type CurrencyContextValue = {
  currency: string;
  setCurrency: (currency: string) => void;
  convert: (amount: number, source: string) => number;
  updatedAt: string | null;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "LKR",
  setCurrency: () => undefined,
  convert: (amount) => amount,
  updatedAt: null,
});

export const displayCurrencies = ["LKR", "USD", "EUR", "GBP", "AUD"];

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState("LKR");
  const [rates, setRates] = useState<Record<string, number>>({ LKR: 1 });
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("navigeto:currency");
    if (saved && displayCurrencies.includes(saved)) requestAnimationFrame(() => setCurrencyState(saved));
    fetch("https://open.er-api.com/v6/latest/LKR")
      .then((response) => response.json())
      .then((data) => {
        if (data?.result === "success" && data?.rates) {
          setRates(data.rates);
          setUpdatedAt(data.time_last_update_utc || null);
        }
      })
      .catch(() => undefined);
  }, []);

  const setCurrency = (next: string) => {
    if (!displayCurrencies.includes(next)) return;
    setCurrencyState(next);
    localStorage.setItem("navigeto:currency", next);
  };

  const value = useMemo<CurrencyContextValue>(() => ({
    currency,
    setCurrency,
    updatedAt,
    convert(amount, source) {
      const sourceRate = rates[source] || 0;
      const targetRate = rates[currency] || 0;
      if (!sourceRate || !targetRate) return amount;
      return amount / sourceRate * targetRate;
    },
  }), [currency, rates, updatedAt]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export const useCurrency = () => useContext(CurrencyContext);
