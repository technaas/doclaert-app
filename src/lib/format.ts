const KWD_CODE = 'KWD';

/**
 * Formats a numeric amount with comma grouping (no currency prefix).
 * Rounds to a whole number when within 0.001 of an integer; otherwise up to 3 decimals.
 */
export function formatKwdAmount(amount: number): string {
  if (!Number.isFinite(amount)) {
    return '0';
  }

  const capped = Math.round(amount * 1000) / 1000;
  const nearestWhole = Math.round(capped);
  const useWhole = Math.abs(capped - nearestWhole) < 0.01;
  const displayValue = useWhole ? nearestWhole : capped;

  return displayValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: useWhole ? 0 : 3,
  });
}

/** Formats an amount as Kuwaiti Dinar for display (e.g. "KWD 15,630"). */
export function formatKwd(amount: number): string {
  return `${KWD_CODE} ${formatKwdAmount(amount)}`;
}

/** @alias formatKwd — used across dashboard, salary, and staff screens. */
export function formatPay(amount: number): string {
  return formatKwd(amount);
}

/** Dashboard display: whole KWD only, non-breaking space after currency code. */
export function formatPayDashboard(amount: number): string {
  if (!Number.isFinite(amount)) {
    return `${KWD_CODE}\u00A00`;
  }
  const whole = Math.round(amount);
  return `${KWD_CODE}\u00A0${whole.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatCount(count: number): string {
  return count.toLocaleString();
}
