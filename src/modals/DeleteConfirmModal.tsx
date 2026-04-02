import { useStore } from '@/store'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export function DeleteConfirmModal() {
  const deleteConfirmId = useStore((s) => s.deleteConfirmId)
  const deleteConfirmType = useStore((s) => s.deleteConfirmType)
  const groups = useStore((s) => s.groups)
  const reactions = useStore((s) => s.reactions)
  const closeDeleteConfirm = useStore((s) => s.closeDeleteConfirm)
  const deleteGroup = useStore((s) => s.deleteGroup)
  const deleteReaction = useStore((s) => s.deleteReaction)

  const isOpen = deleteConfirmId !== null

  const affectedReactions =
    deleteConfirmType === 'group' && deleteConfirmId
      ? Object.values(reactions).filter(
          (r) => r.sourceGroupId === deleteConfirmId || r.targetGroupId === deleteConfirmId
        ).length
      : 0

  const label =
    deleteConfirmType === 'group'
      ? groups[deleteConfirmId ?? '']?.name
      : reactions[deleteConfirmId ?? '']?.name

  const handleConfirm = () => {
    if (!deleteConfirmId) return
    if (deleteConfirmType === 'group') deleteGroup(deleteConfirmId)
    else deleteReaction(deleteConfirmId)
    closeDeleteConfirm()
  }

  return (
    <Modal open={isOpen} onClose={closeDeleteConfirm} title="Confirm Delete">
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-sm text-text-primary font-medium">
              Delete "{label}"?
            </p>
            {affectedReactions > 0 && (
              <p className="text-xs text-red-400 mt-1">
                This will also delete {affectedReactions} reaction{affectedReactions !== 1 ? 's' : ''} referencing this group.
              </p>
            )}
            <p className="text-xs text-text-secondary mt-1">This action cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={closeDeleteConfirm}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirm}>Delete</Button>
        </div>
      </div>
    </Modal>
  )
}
