export function convertToCents(amount: number): number {
  return Math.round(amount * 100);
}

export function convertToDollars(cents: number): number {
  return cents / 100;
}
