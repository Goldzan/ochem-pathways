const PRESET_COLORS = [
  '#4ade80', '#60a5fa', '#f59e0b', '#f87171', '#c084fc',
  '#fb923c', '#34d399', '#a78bfa', '#f472b6', '#38bdf8',
  '#fbbf24', '#86efac', '#818cf8', '#e879f9', '#2dd4bf',
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className="w-7 h-7 rounded-full transition-transform hover:scale-110 ring-offset-2 ring-offset-surface-elevated"
            style={{
              backgroundColor: color,
              boxShadow: value === color ? `0 0 0 2px ${color}` : undefined,
              outline: value === color ? '2px solid white' : undefined,
            }}
          />
        ))}
        <label className="w-7 h-7 rounded-full cursor-pointer border-2 border-dashed border-border hover:border-text-secondary transition-colors flex items-center justify-center overflow-hidden">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="opacity-0 absolute w-0 h-0"
          />
          <span className="text-text-secondary text-xs">+</span>
        </label>
      </div>
    </div>
  )
}
