import { ANALYZE_FIELDS } from '../constants'

export default function UserForm({ values, onChange, onSubmit, loading }) {
  return (
    <form
      className="card"
      onSubmit={e => { e.preventDefault(); onSubmit() }}
    >
      <p className="section-title">Your Financial Profile</p>

      <div className="form-grid">
        {ANALYZE_FIELDS.map(({ key, label, placeholder }) => (
          <div className="field" key={key}>
            <label htmlFor={key}>{label}</label>
            <input
              id={key}
              type="number"
              step="any"
              placeholder={placeholder}
              value={values[key]}
              onChange={e => onChange(key, e.target.value)}
              required
            />
          </div>
        ))}
      </div>

      <button className="btn-analyze" type="submit" disabled={loading}>
        {loading ? 'Analyzing…' : 'Analyze My Home Buying Power'}
      </button>
    </form>
  )
}
