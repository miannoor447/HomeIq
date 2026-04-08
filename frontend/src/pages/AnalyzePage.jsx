import { useAnalyze }   from '../hooks/useAnalyze'
import UserForm          from '../components/UserForm'
import HomeIQScore       from '../components/HomeIQScore'
import MortgageCard      from '../components/MortgageCard'
import PropertyList      from '../components/PropertyList'
import { formatCurrency } from '../utils/format'

function FormSummaryBar({ values, onEdit }) {
  return (
    <div className="form-summary-bar">
      <span>
        Income: <strong>{formatCurrency(Number(values.gross_annual_income))}</strong>
        &nbsp;·&nbsp; Credit: <strong>{values.credit_score}</strong>
        &nbsp;·&nbsp; Down: <strong>{formatCurrency(Number(values.down_payment))}</strong>
        &nbsp;·&nbsp; Debt/mo: <strong>{formatCurrency(Number(values.monthly_debt))}</strong>
      </span>
      <button className="btn-edit" onClick={onEdit}>Edit</button>
    </div>
  )
}

export default function AnalyzePage() {
  const {
    values, result, loading, error,
    collapsed, resultsRef,
    handleChange, handleSubmit, resetForm,
  } = useAnalyze()

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Affordability Analysis</h2>
        <p>Enter your financial profile to get your Home IQ score, max purchase price, and top matching properties.</p>
      </div>

      {collapsed
        ? <FormSummaryBar values={values} onEdit={resetForm} />
        : <UserForm values={values} onChange={handleChange} onSubmit={handleSubmit} loading={loading} />
      }

      {error   && <div className="error-box">{error}</div>}
      {loading && <div className="loader">Crunching the numbers…</div>}

      {result && (
        <div className="results-area" ref={resultsRef}>
          <HomeIQScore iq={result.home_iq} />
          <MortgageCard mortgage={result.sample_mortgage} maxPrice={result.max_purchase_price} />
          <PropertyList properties={result.top3_properties} />
        </div>
      )}
    </div>
  )
}
