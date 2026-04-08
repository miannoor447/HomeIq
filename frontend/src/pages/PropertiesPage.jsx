import { useState, useEffect } from 'react'
import { fetchProperties, analyzeProfile } from '../api'
import { formatCurrency }  from '../utils/format'
import { buildAnalyzePayload } from '../utils/mortgage'
import { CITIES, BUDGET_FIELDS, BUDGET_DEFAULTS } from '../constants'

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterBar({ cityFilter, onCityChange, maxPrice, onlyAfford, onToggleAfford, onOpenBudget, budgetOpen, onClear }) {
  return (
    <div className="filter-bar">
      <select className="filter-select" value={cityFilter} onChange={e => onCityChange(e.target.value)}>
        {CITIES.map(c => <option key={c}>{c}</option>)}
      </select>

      {maxPrice != null && (
        <label className="filter-toggle">
          <input type="checkbox" checked={onlyAfford} onChange={e => onToggleAfford(e.target.checked)} />
          <span>Affordable only</span>
        </label>
      )}

      <button
        className={`btn-budget-toggle${budgetOpen ? ' active' : ''}`}
        onClick={onOpenBudget}
      >
        {maxPrice != null ? `Budget: ${formatCurrency(maxPrice)}` : 'Set My Budget'}
      </button>

      {maxPrice != null && (
        <button className="btn-clear" onClick={onClear}>Clear</button>
      )}
    </div>
  )
}

function BudgetPanel({ budget, onChange, onApply, loading, error }) {
  return (
    <div className="budget-panel card">
      <p className="section-title">Your Budget Profile</p>
      <div className="form-grid budget-grid">
        {BUDGET_FIELDS.map(({ key, label, placeholder }) => (
          <div className="field" key={key}>
            <label>{label}</label>
            <input
              type="number"
              placeholder={placeholder}
              value={budget[key]}
              onChange={e => onChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>
      {error && <p className="inline-error">{error}</p>}
      <button className="btn-analyze" style={{ marginTop: '1rem' }} onClick={onApply} disabled={loading}>
        {loading ? 'Calculating…' : 'Apply Budget'}
      </button>
    </div>
  )
}

function PropertyCard({ property, maxPrice }) {
  const affordable = maxPrice != null && property.price <= maxPrice
  const outOfRange  = maxPrice != null && !affordable

  return (
    <div className={`prop-full-card${affordable ? ' afford-yes' : ''}${outOfRange ? ' afford-no' : ''}`}>
      {maxPrice != null && (
        <div className={`afford-badge ${affordable ? 'badge-green' : 'badge-red'}`}>
          {affordable ? 'Affordable' : 'Out of Range'}
        </div>
      )}

      <div className="pfc-top">
        <div>
          <div className="pfc-address">{property.address}</div>
          <div className="pfc-city">{property.city}</div>
        </div>
        <div className="pfc-price">{formatCurrency(property.price)}</div>
      </div>

      <div className="pfc-stats">
        <div className="pfc-stat">
          <span className="pfc-stat-label">Beds / Baths</span>
          <span className="pfc-stat-val">{property.bedrooms} / {property.bathrooms}</span>
        </div>
        <div className="pfc-stat">
          <span className="pfc-stat-label">Taxes / mo</span>
          <span className="pfc-stat-val">{formatCurrency(property.taxes / 12)}</span>
        </div>
        <div className="pfc-stat">
          <span className="pfc-stat-label">Insurance / mo</span>
          <span className="pfc-stat-val">{formatCurrency(property.insurance / 12)}</span>
        </div>
        <div className="pfc-stat">
          <span className="pfc-stat-label">T&amp;I / mo</span>
          <span className="pfc-stat-val">{formatCurrency((property.taxes + property.insurance) / 12)}</span>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PropertiesPage() {
  const [properties,    setProperties]    = useState([])
  const [pageLoading,   setPageLoading]   = useState(true)
  const [cityFilter,    setCityFilter]    = useState('All Cities')
  const [onlyAfford,    setOnlyAfford]    = useState(false)
  const [maxPrice,      setMaxPrice]      = useState(null)
  const [budget,        setBudget]        = useState(BUDGET_DEFAULTS)
  const [budgetLoading, setBudgetLoading] = useState(false)
  const [budgetError,   setBudgetError]   = useState(null)
  const [budgetOpen,    setBudgetOpen]    = useState(false)

  useEffect(() => {
    fetchProperties()
      .then(setProperties)
      .finally(() => setPageLoading(false))
  }, [])

  function handleBudgetChange(key, val) {
    setBudget(prev => ({ ...prev, [key]: val }))
  }

  async function applyBudget() {
    if (!budget.gross_annual_income || !budget.down_payment) {
      setBudgetError('Income and down payment are required.')
      return
    }
    setBudgetLoading(true)
    setBudgetError(null)
    try {
      const payload = buildAnalyzePayload({
        ...budget,
        monthly_debt: budget.monthly_debt || '0',
        credit_score: budget.credit_score  || '680',
        annual_rate:  '6.5',
      })
      const data = await analyzeProfile(payload)
      setMaxPrice(data.max_purchase_price)
      setBudgetOpen(false)
      setOnlyAfford(false)
    } catch (err) {
      setBudgetError(err.message)
    } finally {
      setBudgetLoading(false)
    }
  }

  function clearBudget() {
    setMaxPrice(null)
    setOnlyAfford(false)
    setBudget(BUDGET_DEFAULTS)
  }

  const filtered = properties.filter(p => {
    if (cityFilter !== 'All Cities' && p.city !== cityFilter) return false
    if (onlyAfford && maxPrice != null && p.price > maxPrice) return false
    return true
  })

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Browse Properties</h2>
        <p>{properties.length} listings across 6 cities  set your budget to see affordability.</p>
      </div>

      <FilterBar
        cityFilter={cityFilter}
        onCityChange={setCityFilter}
        maxPrice={maxPrice}
        onlyAfford={onlyAfford}
        onToggleAfford={setOnlyAfford}
        onOpenBudget={() => setBudgetOpen(o => !o)}
        budgetOpen={budgetOpen}
        onClear={clearBudget}
      />

      {budgetOpen && (
        <BudgetPanel
          budget={budget}
          onChange={handleBudgetChange}
          onApply={applyBudget}
          loading={budgetLoading}
          error={budgetError}
        />
      )}

      {pageLoading ? (
        <div className="loader">Loading properties…</div>
      ) : (
        <>
          <p className="results-count">
            Showing <strong>{filtered.length}</strong> of {properties.length} properties
            {maxPrice != null && (
              <span>  affordable up to <strong className="c-green">{formatCurrency(maxPrice)}</strong></span>
            )}
          </p>

          <div className="prop-grid">
            {filtered.map(p => (
              <PropertyCard key={p.id} property={p} maxPrice={maxPrice} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="empty-state">No properties match your filters.</p>
          )}
        </>
      )}
    </div>
  )
}
