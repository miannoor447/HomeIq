import { lazy, Suspense, useState } from 'react'
import Nav from './components/Nav'

const AnalyzePage    = lazy(() => import('./pages/AnalyzePage'))
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'))
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'))

const PAGE_MAP = {
  analyze:    <AnalyzePage />,
  properties: <PropertiesPage />,
  calculator: <CalculatorPage />,
}

function PageLoader() {
  return <div className="loader">Loading…</div>
}

export default function App() {
  const [page, setPage] = useState('analyze')

  return (
    <div className="app-root">
      <Nav page={page} setPage={setPage} />
      <main className="app-main">
        <Suspense fallback={<PageLoader />}>
          {PAGE_MAP[page]}
        </Suspense>
      </main>
    </div>
  )
}
