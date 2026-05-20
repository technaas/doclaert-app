export function formatPay(amount: number): string {
  return `KWD ${amount.toFixed(3)}`;
}

export function formatCount(count: number): string {
  return count.toLocaleString();
}
