export function GraphLegend() {
  return (
    <div className="flex items-center gap-4 px-3 py-2 bg-surface/90 backdrop-blur-sm border border-border rounded-xl text-xs text-text-secondary">
      <div className="flex items-center gap-1.5">
        <div className="w-8 h-0.5 bg-blue-400 rounded-full" />
        <span>Reaction</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-8 h-0.5 rounded-full" style={{ background: 'repeating-linear-gradient(90deg, #a78bfa 0, #a78bfa 4px, transparent 4px, transparent 8px)' }} />
        <span className="text-purple-400">+ Mechanism</span>
      </div>
    </div>
  )
}
