import './ThemeToggle.css'

export function ThemeToggle({ isDark, onToggle }) {
  return (
    <div className="theme-toggle-container">
      <button
        className="theme-toggle"
        onClick={onToggle}
        aria-label="Toggle theme"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="theme-icon">
          {isDark ? '☀️' : '🌙'}
        </span>
      </button>
    </div>
  )
}
