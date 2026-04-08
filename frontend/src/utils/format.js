/**
 * Format a number as USD currency, no decimal places.
 * Returns ' ' for null / undefined.
 */
export function formatCurrency(n) {
  if (n == null) return ' '
  return n.toLocaleString('en-US', {
    style:                'currency',
    currency:             'USD',
    maximumFractionDigits: 0,
  })
}

/**
 * Format a decimal as a percentage string, e.g. 0.1567 → "15.7%"
 */
export function formatPct(n, decimals = 1) {
  if (n == null) return ' '
  return `${(n * 100).toFixed(decimals)}%`
}
