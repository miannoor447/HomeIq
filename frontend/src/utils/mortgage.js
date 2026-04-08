/**
 * Pure client-side mortgage calculator.
 * Mirrors the Python logic in backend/mortgage.py.
 *
 * Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 *   P = loan amount
 *   r = monthly rate (annualRate / 12)
 *   n = loan term in months
 */
export function calculateMortgage({
  price,
  downPayment,
  annualRate,
  years,
  annualTaxes    = 0,
  annualInsurance = 0,
}) {
  const loan    = Math.max(price - downPayment, 0)
  const r       = annualRate / 12
  const n       = years * 12
  const factor  = Math.pow(1 + r, n)
  const pi      = r === 0 ? loan / n : loan * (r * factor) / (factor - 1)
  const taxes   = annualTaxes / 12
  const ins     = annualInsurance / 12
  const dpPct   = price > 0 ? (downPayment / price) * 100 : 0

  return {
    loan,
    pi,
    taxes,
    insurance: ins,
    total:     pi + taxes + ins,
    dpPct,
  }
}

/**
 * Build the payload expected by POST /api/analyze from raw form string values.
 */
export function buildAnalyzePayload(values) {
  return {
    gross_annual_income: parseFloat(values.gross_annual_income),
    monthly_debt:        parseFloat(values.monthly_debt),
    credit_score:        parseInt(values.credit_score, 10),
    down_payment:        parseFloat(values.down_payment),
    annual_rate:         parseFloat(values.annual_rate) / 100,
  }
}
