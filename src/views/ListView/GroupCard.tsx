import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import type { FunctionalGroup } from '@/types'
import { useStore, useReactionsForGroup } from '@/store'
import { IconButton } from '@/components/shared/IconButton'
import { Button } from '@/components/shared/Button'
import { ReactionRow } from './ReactionRow'

interface GroupCardProps {
  group: FunctionalGroup
}

export function GroupCard({ group }: GroupCardProps) {
  const [expanded, setExpanded] = useState(true)
  const reactions = useReactionsForGroup(group.id)
  const openGroupModal = useStore((s) => s.openGroupModal)
  const openReactionModal = useStore((s) => s.openReactionModal)
  const openDeleteConfirm = useStore((s) => s.openDeleteConfirm)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      className="bg-surface border border-border rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-white/2 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: group.color, boxShadow: `0 0 8px ${group.color}66` }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary">{group.name}</h3>
          {group.formula && (
            <p className="text-xs text-text-secondary font-mono">{group.formula}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-text-secondary mr-1">
            {reactions.length} reaction{reactions.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <IconButton label="Edit group" onClick={() => openGroupModal(group.id)}>
              <PencilIcon className="w-3.5 h-3.5" />
            </IconButton>
            <IconButton label="Delete group" variant="danger" onClick={() => openDeleteConfirm(group.id, 'group')}>
              <TrashIcon className="w-3.5 h-3.5" />
            </IconButton>
          </div>
          <ChevronDownIcon
            className={`w-4 h-4 text-text-secondary transition-transform duration-200 ml-1 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-border/50 pt-3">
              {group.imageDataUrl && (
                <img
                  src={group.imageDataUrl}
                  alt={`${group.name} structure`}
                  className="w-full rounded-lg border border-border/40 object-contain max-h-40 mb-1"
                />
              )}
              {reactions.length === 0 && (
                <p className="text-xs text-text-secondary text-center py-3">
                  No reactions yet. Add one below.
                </p>
              )}
              <AnimatePresence>
                {reactions.map((reaction) => (
                  <ReactionRow key={reaction.id} reaction={reaction} />
                ))}
              </AnimatePresence>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center border border-dashed border-border hover:border-blue-500/50 hover:text-blue-400 mt-1"
                onClick={() => openReactionModal(group.id)}
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Add reaction
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
