export const CITIES = [
  'All Cities',
  'Austin, TX',
  'Denver, CO',
  'Phoenix, AZ',
  'Nashville, TN',
  'Atlanta, GA',
  'Charlotte, NC',
]

export const ANALYZE_DEFAULTS = {
  gross_annual_income: '',
  monthly_debt:        '',
  credit_score:        '',
  down_payment:        '',
  annual_rate:         '6.5',
}

export const BUDGET_DEFAULTS = {
  gross_annual_income: '',
  monthly_debt:        '',
  down_payment:        '',
  credit_score:        '',
}

export const CALC_DEFAULTS = {
  price:       '',
  downPayment: '',
  rate:        '6.5',
  years:       '30',
  taxes:       '',
  insurance:   '',
}

export const ANALYZE_FIELDS = [
  { key: 'gross_annual_income', label: 'Annual Gross Income ($)',       placeholder: '95000' },
  { key: 'monthly_debt',        label: 'Monthly Debt Payments ($)',     placeholder: '800'   },
  { key: 'credit_score',        label: 'Credit Score (300  850)',      placeholder: '720'   },
  { key: 'down_payment',        label: 'Down Payment ($)',              placeholder: '50000' },
  { key: 'annual_rate',         label: 'Interest Rate (%, default 6.5)',placeholder: '6.5'   },
]

export const BUDGET_FIELDS = [
  { key: 'gross_annual_income', label: 'Annual Income ($)',  placeholder: '95000' },
  { key: 'monthly_debt',        label: 'Monthly Debt ($)',   placeholder: '800'   },
  { key: 'down_payment',        label: 'Down Payment ($)',   placeholder: '50000' },
  { key: 'credit_score',        label: 'Credit Score',       placeholder: '720'   },
]
