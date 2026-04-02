import { BeakerIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/shared/Button'
import { useStore } from '@/store'

export function EmptyState() {
  const openGroupModal = useStore((s) => s.openGroupModal)

  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
        <BeakerIcon className="w-8 h-8 text-blue-400" />
      </div>
      <h2 className="text-lg font-semibold text-text-primary mb-2">No functional groups yet</h2>
      <p className="text-sm text-text-secondary mb-6 max-w-xs">
        Add your first functional group to start building reaction pathways.
      </p>
      <Button variant="primary" onClick={() => openGroupModal()}>
        Add your first group
      </Button>
    </div>
  )
}
