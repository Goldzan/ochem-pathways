import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import {
  useStore,
  useSelectedGroup,
  useSelectedReaction,
  useGroups,
  useStudyMode,
  useReactionsForGroup,
} from '@/store'
import { IconButton } from '@/components/shared/IconButton'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import { MechanismStepList } from '@/views/ListView/MechanismStepList'

export function DetailPanel() {
  const detailPanelOpen = useStore((s) => s.detailPanelOpen)
  const selectedGroup = useSelectedGroup()
  const selectedReaction = useSelectedReaction()
  const groups = useGroups()
  const studyMode = useStudyMode()
  const openGroupModal = useStore((s) => s.openGroupModal)
  const openReactionModal = useStore((s) => s.openReactionModal)
  const openDeleteConfirm = useStore((s) => s.openDeleteConfirm)
  const setSelectedNode = useStore((s) => s.setSelectedNode)

  const groupReactions = useReactionsForGroup(selectedGroup?.id ?? '')

  return (
    <AnimatePresence>
      {detailPanelOpen && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="absolute top-0 right-0 bottom-0 w-80 bg-surface border-l border-border flex flex-col z-20 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">
              {selectedGroup ? selectedGroup.name : selectedReaction?.name}
            </h3>
            <div className="flex items-center gap-1">
              {selectedGroup && (
                <>
                  <IconButton label="Edit" onClick={() => openGroupModal(selectedGroup.id)}>
                    <PencilIcon className="w-3.5 h-3.5" />
                  </IconButton>
                  <IconButton label="Delete" variant="danger" onClick={() => openDeleteConfirm(selectedGroup.id, 'group')}>
                    <TrashIcon className="w-3.5 h-3.5" />
                  </IconButton>
                </>
              )}
              {selectedReaction && (
                <>
                  <IconButton label="Edit" onClick={() => openReactionModal(selectedReaction.sourceGroupId, selectedReaction.id)}>
                    <PencilIcon className="w-3.5 h-3.5" />
                  </IconButton>
                  <IconButton label="Delete" variant="danger" onClick={() => openDeleteConfirm(selectedReaction.id, 'reaction')}>
                    <TrashIcon className="w-3.5 h-3.5" />
                  </IconButton>
                </>
              )}
              <IconButton label="Close" onClick={() => setSelectedNode(null)}>
                <XMarkIcon className="w-4 h-4" />
              </IconButton>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedGroup && (
              <GroupDetail
                group={selectedGroup}
                reactions={groupReactions}
                groups={groups}
                studyMode={studyMode}
                onAddReaction={() => openReactionModal(selectedGroup.id)}
                onEditReaction={(id) => openReactionModal(selectedGroup.id, id)}
                onDeleteReaction={(id) => openDeleteConfirm(id, 'reaction')}
              />
            )}
            {selectedReaction && (
              <ReactionDetail reaction={selectedReaction} groups={groups} studyMode={studyMode} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function GroupDetail({
  group,
  reactions,
  groups,
  studyMode,
  onAddReaction,
  onEditReaction,
  onDeleteReaction,
}: {
  group: ReturnType<typeof useSelectedGroup>
  reactions: ReturnType<typeof useReactionsForGroup>
  groups: ReturnType<typeof useGroups>
  studyMode: boolean
  onAddReaction: () => void
  onEditReaction: (id: string) => void
  onDeleteReaction: (id: string) => void
}) {
  if (!group) return null
  return (
    <>
      <div className="flex items-center gap-3">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: group.color, boxShadow: `0 0 10px ${group.color}55` }}
        />
        <div>
          <p className="text-sm font-semibold text-text-primary">{group.name}</p>
          {group.formula && <p className="text-xs text-text-secondary font-mono">{group.formula}</p>}
        </div>
      </div>
      {group.imageDataUrl && (
        <img
          src={group.imageDataUrl}
          alt={`${group.name} structure`}
          className="w-full rounded-lg border border-border/40 object-contain max-h-40"
        />
      )}

      <div>
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
          Reactions ({reactions.length})
        </p>
        <div className="space-y-2">
          {reactions.map((r) => {
            const target = groups[r.targetGroupId]
            return (
              <div key={r.id} className="flex items-start justify-between gap-2 p-2.5 bg-surface-elevated rounded-lg border border-border/50 group/r">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary">{r.name}</p>
                  {!studyMode && (
                    <p className="text-xs text-text-secondary font-mono mt-0.5">{r.conditions}</p>
                  )}
                  {target && <Badge color={target.color} className="mt-1">→ {target.name}</Badge>}
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover/r:opacity-100 transition-opacity">
                  <IconButton label="Edit" onClick={() => onEditReaction(r.id)}>
                    <PencilIcon className="w-3 h-3" />
                  </IconButton>
                  <IconButton label="Delete" variant="danger" onClick={() => onDeleteReaction(r.id)}>
                    <TrashIcon className="w-3 h-3" />
                  </IconButton>
                </div>
              </div>
            )
          })}
          <Button variant="ghost" size="sm" className="w-full justify-center border border-dashed border-border" onClick={onAddReaction}>
            <PlusIcon className="w-3.5 h-3.5" />
            Add Reaction
          </Button>
        </div>
      </div>
    </>
  )
}

function ReactionDetail({
  reaction,
  groups,
  studyMode,
}: {
  reaction: NonNullable<ReturnType<typeof useSelectedReaction>>
  groups: ReturnType<typeof useGroups>
  studyMode: boolean
}) {
  const source = groups[reaction.sourceGroupId]
  const target = groups[reaction.targetGroupId]

  return (
    <>
      <div className="flex items-center gap-2 text-sm">
        {source && <Badge color={source.color}>{source.name}</Badge>}
        <span className={`text-xs ${reaction.hasMechanism ? 'text-purple-400' : 'text-blue-400'}`}>→</span>
        {target && <Badge color={target.color}>{target.name}</Badge>}
      </div>

      {!studyMode ? (
        <div className="p-3 bg-surface-elevated rounded-lg border border-border">
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Conditions</p>
          <p className="text-sm text-text-primary font-mono">{reaction.conditions}</p>
        </div>
      ) : (
        <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20 text-center">
          <p className="text-xs text-amber-400 italic">Conditions hidden in study mode</p>
        </div>
      )}

      {reaction.hasMechanism && (
        <div>
          <MechanismStepList steps={reaction.mechanism} />
        </div>
      )}
    </>
  )
}
