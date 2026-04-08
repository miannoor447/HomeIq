import { useState, useEffect } from 'react'
import { calculateMortgage }  from '../utils/mortgage'
import { formatCurrency }     from '../utils/format'
import { CALC_DEFAULTS }      from '../constants'

// ── Sub-components ────────────────────────────────────────────────────────────

const REQUIRED_FIELDS = [
  { key: 'price',       label: 'Home Price ($)',    placeholder: '350000' },
  { key: 'downPayment', label: 'Down Payment ($)',  placeholder: '50000'  },
  { key: 'rate',        label: 'Interest Rate (%)', placeholder: '6.5'    },
  { key: 'years',       label: 'Loan Term (years)', placeholder: '30'     },
]

const OPTIONAL_FIELDS = [
  { key: 'taxes',     label: 'Annual Property Taxes ($)',   placeholder: '4200' },
  { key: 'insurance', label: 'Annual Homeowners Ins. ($)',  placeholder: '1800' },
]

function FieldGroup({ fields, values, onChange }) {
  return fields.map(({ key, label, placeholder }) => (
    <div className="field" key={key} style={{ marginBottom: '1rem' }}>
      <label>{label}</label>
      <input
        type="number"
        step="any"
        placeholder={placeholder}
        value={values[key]}
        onChange={e => onChange(key, e.target.value)}
      />
    </div>
  ))
}

function CompositionBar({ pi, taxes, insurance, total }) {
  if (!total) return null
  return (
    <div style={{ marginTop: '1.5rem' }}>
      <p className="section-title">Cost Composition</p>
      <div className="comp-bar-track">
        <div className="comp-bar-seg seg-pi"  style={{ width: `${(pi / total) * 100}%` }} />
        <div className="comp-bar-seg seg-tax" style={{ width: `${(taxes / total) * 100}%` }} />
        <div className="comp-bar-seg seg-ins" style={{ width: `${(insurance / total) * 100}%` }} />
      </div>
      <div className="comp-legend">
        <span><span className="leg-dot dot-pi" /> Principal &amp; Interest</span>
        <span><span className="leg-dot dot-tax" /> Taxes</span>
        <span><span className="leg-dot dot-ins" /> Insurance</span>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  const [values, setValues] = useState(CALC_DEFAULTS)
  const [result, setResult] = useState(null)

  function handleChange(key, val) {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  useEffect(() => {
    const price    = parseFloat(values.price)
    const dp       = parseFloat(values.downPayment)
    const rate     = parseFloat(values.rate) / 100
    const years    = parseInt(values.years, 10)
    const taxes    = parseFloat(values.taxes)    || 0
    const ins      = parseFloat(values.insurance) || 0

    if (!price || !dp || !rate || !years) { setResult(null); return }

    setResult(calculateMortgage({
      price, downPayment: dp, annualRate: rate,
      years, annualTaxes: taxes, annualInsurance: ins,
    }))
  }, [values])

  const downPayment = parseFloat(values.downPayment) || 0

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Mortgage Calculator</h2>
        <p>Instantly estimate your monthly payment for any home price. Updates as you type.</p>
      </div>

      <div className="calc-layout">

        {/* ── Inputs ── */}
        <div className="card">
          <p className="section-title">Loan Details</p>
          <div className="calc-fields">
            <div>
              <p className="section-title" style={{ marginBottom: '0.6rem' }}>Required</p>
              <FieldGroup fields={REQUIRED_FIELDS} values={values} onChange={handleChange} />
            </div>
            <div>
              <p className="section-title" style={{ marginBottom: '0.6rem' }}>Optional (PITI)</p>
              <FieldGroup fields={OPTIONAL_FIELDS} values={values} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        <div className="card">
          <p className="section-title">Payment Breakdown</p>

          {!result ? (
            <p className="calc-placeholder">
              Fill in home price, down payment, rate, and term to see your estimate.
            </p>
          ) : (
            <>
              <div className="calc-big-num">
                <span className="calc-big-label">Total Monthly Payment</span>
                <span className="calc-big-val c-green">{formatCurrency(result.total)}</span>
              </div>

              <div className="calc-breakdown">
                <div className="calc-row">
                  <span className="calc-row-label">Loan Amount</span>
                  <span className="calc-row-val">{formatCurrency(result.loan)}</span>
                </div>
                <div className="calc-row">
                  <span className="calc-row-label">Down Payment</span>
                  <span className="calc-row-val">{formatCurrency(downPayment)} ({result.dpPct.toFixed(1)}%)</span>
                </div>
                <hr className="mort-divider" />
                <div className="calc-row">
                  <span className="calc-row-label">Principal + Interest</span>
                  <span className="calc-row-val">{formatCurrency(result.pi)}</span>
                </div>
                <div className="calc-row">
                  <span className="calc-row-label">Taxes / mo</span>
                  <span className="calc-row-val">
                    {result.taxes > 0 ? formatCurrency(result.taxes) : <span className="text-muted"> </span>}
                  </span>
                </div>
                <div className="calc-row">
                  <span className="calc-row-label">Insurance / mo</span>
                  <span className="calc-row-val">
                    {result.insurance > 0 ? formatCurrency(result.insurance) : <span className="text-muted"> </span>}
                  </span>
                </div>
              </div>

              <CompositionBar
                pi={result.pi}
                taxes={result.taxes}
                insurance={result.insurance}
                total={result.total}
              />

              <p className="calc-assumption-note">
                {values.rate}% fixed · {values.years}-year term
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
