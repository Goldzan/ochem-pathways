import { BeakerIcon, PlusIcon } from '@heroicons/react/24/outline'
import { ViewToggle } from './ViewToggle'
import { StudyModeToggle } from './StudyModeToggle'
import { Button } from './shared/Button'
import { useStore } from '@/store'

export function TopBar() {
  const openGroupModal = useStore((s) => s.openGroupModal)

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

      <Button variant="primary" size="sm" onClick={() => openGroupModal()}>
        <PlusIcon className="w-3.5 h-3.5" />
        Add Group
      </Button>
    </header>
  )
}
