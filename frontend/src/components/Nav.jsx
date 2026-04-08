const LINKS = [
  { id: 'analyze',    label: 'Analyze',    icon: '⚡' },
  { id: 'properties', label: 'Properties', icon: '🏠' },
  { id: 'calculator', label: 'Calculator', icon: '🧮' },
]

export default function Nav({ page, setPage }) {
  return (
    <nav className="topnav">
      <button className="topnav-brand" onClick={() => setPage('analyze')}>
        <span className="brand-dot" />
        HomeIQ
      </button>

      <div className="topnav-links">
        {LINKS.map(({ id, label, icon }) => (
          <button
            key={id}
            className={`nav-link${page === id ? ' active' : ''}`}
            onClick={() => setPage(id)}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}
