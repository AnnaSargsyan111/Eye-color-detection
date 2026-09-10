const IRIS_COLOR = {
  brown: '#6F4E37',
  hazel: '#8E7648',
  green: '#6B8F71',
  blue: '#4A7A9D',
  gray: '#8B95A1',
  amber: '#C08A3E',
  black: '#1C1714',
}

export default function EyeColorIcon({ color, size = 20 }) {
  const iris = IRIS_COLOR[color] ?? '#9C9188'
  const width = size
  const height = size * 0.65

  return (
    <svg width={width} height={height} viewBox="0 0 20 13" fill="none" aria-hidden="true">
      <ellipse cx="10" cy="6.5" rx="9.3" ry="6" stroke="#7A6F66" strokeWidth="1.1" />
      <circle cx="10" cy="6.5" r="3.6" fill={iris} />
      <circle cx="11.2" cy="5.3" r="1.3" fill="#1A1310" />
    </svg>
  )
}
