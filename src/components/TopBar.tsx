import { BeakerIcon, PlusIcon, CloudArrowUpIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import { ViewToggle } from './ViewToggle'
import { StudyModeToggle } from './StudyModeToggle'
import { Button } from './shared/Button'
import { useStore } from '@/store'
import type { SyncStatus } from '@/types'

function SyncDot({ status }: { status: SyncStatus }) {
  if (status === 'idle') return null
  const colors: Record<Exclude<SyncStatus, 'idle'>, string> = {
    connecting: 'bg-amber-400 animate-pulse',
    synced: 'bg-green-400',
    error: 'bg-red-400',
    'permission-denied': 'bg-red-400',
  }
  return (
    <span
      className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${colors[status as Exclude<SyncStatus, 'idle'>]}`}
    />
  )
}

export function TopBar() {
  const openGroupModal = useStore((s) => s.openGroupModal)
  const openSyncModal = useStore((s) => s.openSyncModal)
  const openTestModal = useStore((s) => s.openTestModal)
  const syncStatus = useStore((s) => s.syncStatus)

  return (
    <header className="flex items-center gap-4 px-4 md:px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-2 mr-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <BeakerIcon className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="text-base font-semibold text-text-primary hidden sm:block tracking-tight">
          OChem<span className="text-blue-400">Pathways</span>
        </span>
      </div>

      <ViewToggle />

      <div className="flex-1" />

      <StudyModeToggle />

      <button
        onClick={openTestModal}
        title="Test yourself"
        className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
      >
        <AcademicCapIcon className="w-5 h-5" />
      </button>

      <button
        onClick={openSyncModal}
        title="Sync across devices"
        className="relative p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
      >
        <CloudArrowUpIcon className="w-5 h-5" />
        <SyncDot status={syncStatus} />
      </button>

      <Button variant="primary" size="sm" onClick={() => openGroupModal()}>
        <PlusIcon className="w-3.5 h-3.5" />
        Add Group
      </Button>
    </header>
  )
}
