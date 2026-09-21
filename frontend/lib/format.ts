export type CurrencyCode = "LKR" | "USD";

// Approximate, static conversion for demo purposes. Replace with a live FX rate in production.
const RATE_USD_PER_LKR = 1 / 300;

export function formatPrice(priceInUsd: number, currency: CurrencyCode): string {
  if (currency === "USD") {
    return `$${priceInUsd.toFixed(2)}`;
  }
  const lkr = priceInUsd / RATE_USD_PER_LKR;
  return `Rs ${lkr.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}
