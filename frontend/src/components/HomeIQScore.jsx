const COLOR_MAP = {
  green:  { ring: 'border-green c-green',   fill: 'fill-green'  },
  yellow: { ring: 'border-yellow c-yellow', fill: 'fill-yellow' },
  red:    { ring: 'border-red c-red',        fill: 'fill-accent' },
}

const BREAKDOWN_BARS = [
  { label: 'Credit Score',   key: 'credit_score_points', max: 40 },
  { label: 'Debt-to-Income', key: 'dti_points',          max: 35 },
  { label: 'Down Payment',   key: 'down_payment_points', max: 25 },
]

function barFillClass(pts, max) {
  if (pts >= max * 0.7) return 'fill-green'
  if (pts >= max * 0.4) return 'fill-yellow'
  return 'fill-accent'
}

export default function HomeIQScore({ iq }) {
  const { score, category, category_color, breakdown, ratios, recommendations } = iq
  const { ring } = COLOR_MAP[category_color] ?? COLOR_MAP.red
  const [ringClass, textClass] = ring.split(' ')

  return (
    <div className="card iq-card">
      <p className="section-title">Home IQ Score</p>

      <div className={`iq-score-ring ${ringClass} ${textClass}`}>
        <span className={`score-num ${textClass}`}>{score}</span>
        <span className="score-max">/ 100</span>
      </div>

      <p className={`iq-category ${textClass}`}>{category}</p>

      <p className="iq-ratios">
        DTI: {ratios.dti_pct}% &nbsp;|&nbsp; Down: {ratios.down_payment_pct}%
      </p>

      <div className="breakdown-bars">
        {BREAKDOWN_BARS.map(({ label, key, max }) => {
          const pts = breakdown[key]
          return (
            <div className="bar-row" key={key}>
              <span className="bar-label">{label}</span>
              <div className="bar-track">
                <div
                  className={`bar-fill ${barFillClass(pts, max)}`}
                  style={{ width: `${(pts / max) * 100}%` }}
                />
              </div>
              <span className="bar-pts">{pts}/{max}</span>
            </div>
          )
        })}
      </div>

      {recommendations.length > 0 && (
        <div className="recommendations">
          <p className="section-title" style={{ marginTop: '1.25rem' }}>Recommendations</p>
          <ul className="rec-list">
            {recommendations.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
