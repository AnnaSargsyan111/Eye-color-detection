export const PASSWORD_RULES = [
  { key: 'length', label: '8+ characters', test: (v) => v.length >= 8 },
  { key: 'uppercase', label: 'Uppercase', test: (v) => /[A-Z]/.test(v) },
  { key: 'lowercase', label: 'Lowercase', test: (v) => /[a-z]/.test(v) },
  { key: 'number', label: 'Number', test: (v) => /[0-9]/.test(v) },
  { key: 'symbol', label: 'Symbol', test: (v) => /[^A-Za-z0-9]/.test(v) },
]

export default function PasswordRequirements({ value = '' }) {
  return (
    <ul className="flex flex-row flex-wrap gap-x-4 gap-y-1.5">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value)
        return (
          <li
            key={rule.key}
            className={`flex items-center gap-1.5 text-caption ${met ? 'text-success' : 'text-unmet'}`}
          >
            <span aria-hidden="true">{met ? '✓' : 'ⓧ'}</span>
            <span>{rule.label}</span>
          </li>
        )
      })}
    </ul>
  )
}
