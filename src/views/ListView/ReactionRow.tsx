import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRightIcon, ChevronDownIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import type { Reaction } from '@/types'
import { useStore, useGroups, useStudyMode } from '@/store'
import { Badge } from '@/components/shared/Badge'
import { IconButton } from '@/components/shared/IconButton'
import { MechanismStepList } from './MechanismStepList'

interface ReactionRowProps {
  reaction: Reaction
}

export function ReactionRow({ reaction }: ReactionRowProps) {
  const groups = useGroups()
  const studyMode = useStudyMode()
  const openReactionModal = useStore((s) => s.openReactionModal)
  const openDeleteConfirm = useStore((s) => s.openDeleteConfirm)
  const [mechanismOpen, setMechanismOpen] = useState(false)

  const targetGroup = groups[reaction.targetGroupId]

  return (
    <div className="group/row rounded-xl border border-border/50 bg-surface/40 hover:border-border transition-colors duration-200 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Arrow indicator */}
        <div className="flex-shrink-0 flex items-center">
          {reaction.hasMechanism ? (
            <div className="relative">
              <ArrowRightIcon className="w-4 h-4 text-purple-400" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full" />
            </div>
          ) : (
            <ArrowRightIcon className="w-4 h-4 text-blue-400" />
          )}
        </div>

        {/* Reaction info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-text-primary">{reaction.name}</span>
            {targetGroup && (
              <Badge color={targetGroup.color}>
                → {targetGroup.name}
              </Badge>
            )}
            {reaction.hasMechanism && (
              <span className="text-xs text-purple-400 font-medium">mechanism</span>
            )}
          </div>
          <AnimatePresence>
            {!studyMode && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-text-secondary mt-0.5 font-mono"
              >
                {reaction.conditions}
              </motion.p>
            )}
          </AnimatePresence>
          {studyMode && (
            <p className="text-xs text-amber-400/70 mt-0.5 italic">Conditions hidden</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
          {reaction.hasMechanism && (
            <IconButton
              label={mechanismOpen ? 'Hide mechanism' : 'Show mechanism'}
              onClick={() => setMechanismOpen((v) => !v)}
              className="text-purple-400 hover:text-purple-300"
            >
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform duration-200 ${mechanismOpen ? 'rotate-180' : ''}`}
              />
            </IconButton>
          )}
          <IconButton
            label="Edit reaction"
            onClick={() => openReactionModal(reaction.sourceGroupId, reaction.id)}
          >
            <PencilIcon className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton
            label="Delete reaction"
            variant="danger"
            onClick={() => openDeleteConfirm(reaction.id, 'reaction')}
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      </div>

      <AnimatePresence>
        {mechanismOpen && reaction.mechanism.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-4 pb-3"
          >
            <MechanismStepList steps={reaction.mechanism} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
