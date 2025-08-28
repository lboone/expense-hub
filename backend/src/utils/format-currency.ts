export function convertToCents(amount: number): number {
  return Math.round(amount * 100);
}
export function convertToDollars(cents: number): number {
  return cents / 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
