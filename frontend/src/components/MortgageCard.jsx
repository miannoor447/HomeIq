import { formatCurrency } from '../utils/format'

export default function MortgageCard({ mortgage, maxPrice }) {
  if (!mortgage) return null

  const purchasePrice = mortgage.loan_amount + mortgage.down_payment

  const rows = [
    { label: 'Purchase Price',           value: formatCurrency(purchasePrice) },
    { label: 'Down Payment',             value: `${formatCurrency(mortgage.down_payment)} (${mortgage.down_payment_pct}%)` },
    { label: 'Loan Amount',              value: formatCurrency(mortgage.loan_amount) },
    { label: 'Rate / Term',              value: `${mortgage.annual_rate_pct}% / ${mortgage.loan_term_years}-yr fixed` },
    null,
    { label: 'Principal + Interest',     value: formatCurrency(mortgage.monthly_pi) },
    { label: 'Taxes (est. monthly)',     value: formatCurrency(mortgage.monthly_taxes) },
    { label: 'Insurance (est. monthly)', value: formatCurrency(mortgage.monthly_insurance) },
  ]

  return (
    <div className="card">
      <p className="section-title">Mortgage Breakdown</p>
      <p className="card-subtitle">Based on the most affordable property in your range</p>

      <div className="mort-rows">
        {rows.map((row, i) =>
          row === null
            ? <hr key={i} className="mort-divider" />
            : (
              <div className="mort-row" key={i}>
                <span className="m-label">{row.label}</span>
                <span className="m-val">{row.value}</span>
              </div>
            )
        )}
        <hr className="mort-divider" />
        <div className="mort-row mort-total">
          <span>Total Monthly Payment</span>
          <span className="c-green">{formatCurrency(mortgage.total_monthly_payment)}</span>
        </div>
      </div>

      <div className="stat" style={{ marginTop: '1.1rem' }}>
        <span className="label">Max Purchase Price</span>
        <div className="value c-green">{formatCurrency(maxPrice)}</div>
        <div className="sub">Based on 43% DTI ceiling</div>
      </div>
    </div>
  )
}
