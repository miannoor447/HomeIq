import { formatCurrency } from '../utils/format'

const MEDALS = ['🥇', '🥈', '🥉']

function PropertyCard({ property, rank }) {
  const { address, city, bedrooms, bathrooms, price, taxes, mortgage } = property

  return (
    <div className="prop-card">
      <span className="prop-rank">{MEDALS[rank] ?? `#${rank + 1}`}</span>

      <div className="prop-info">
        <div className="prop-address">{address}</div>
        <div className="prop-city">{city}</div>
        <div className="prop-beds">{bedrooms} bed · {bathrooms} bath</div>
      </div>

      <div className="prop-price-col">
        <div className="prop-price">{formatCurrency(price)}</div>
        {mortgage && (
          <div className="prop-monthly">~{formatCurrency(mortgage.total_monthly_payment)}/mo</div>
        )}
        <div className="prop-monthly">Taxes: {formatCurrency(taxes / 12)}/mo</div>
      </div>
    </div>
  )
}

export default function PropertyList({ properties }) {
  if (!properties?.length) {
    return (
      <div className="card full-width">
        <p className="section-title">Top 3 Affordable Properties</p>
        <p className="empty-state">
          No properties found within your price range.
          Try increasing your down payment or income.
        </p>
      </div>
    )
  }

  return (
    <div className="card full-width">
      <p className="section-title">Top 3 Affordable Properties</p>
      <div className="prop-list">
        {properties.map((property, i) => (
          <PropertyCard key={property.id} property={property} rank={i} />
        ))}
      </div>
    </div>
  )
}
