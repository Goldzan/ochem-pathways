import { ListBulletIcon } from '@heroicons/react/24/outline'
import { ShareIcon } from '@heroicons/react/24/outline'
import { useStore, useActiveView } from '@/store'
import type { ActiveView } from '@/types'

const tabs: { id: ActiveView; label: string; Icon: typeof ListBulletIcon }[] = [
  { id: 'graph', label: 'Graph', Icon: ShareIcon },
  { id: 'list', label: 'List', Icon: ListBulletIcon },
]

export function ViewToggle() {
  const activeView = useActiveView()
  const setActiveView = useStore((s) => s.setActiveView)

  return (
    <div className="flex items-center gap-0.5 bg-bg rounded-lg p-1 border border-border">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => setActiveView(id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
            activeView === id
              ? 'bg-surface-elevated text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  )
}
