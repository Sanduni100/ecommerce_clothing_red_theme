"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { CurrencyCode } from "@/lib/format";

const CurrencyContext = createContext<{ currency: CurrencyCode; toggleCurrency: () => void }>({
  currency: "LKR",
  toggleCurrency: () => {},
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>("LKR");

  useEffect(() => {
    const stored = localStorage.getItem("lumine_currency") as CurrencyCode | null;
    if (stored) setCurrency(stored);
  }, []);

  function toggleCurrency() {
    setCurrency((prev) => {
      const next = prev === "LKR" ? "USD" : "LKR";
      localStorage.setItem("lumine_currency", next);
      return next;
    });
  }

  return <CurrencyContext.Provider value={{ currency, toggleCurrency }}>{children}</CurrencyContext.Provider>;
}

export const useCurrency = () => useContext(CurrencyContext);
