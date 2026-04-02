import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDownIcon } from '@heroicons/react/24/outline'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { useStore } from '@/store'
import type { FunctionalGroup, Reaction } from '@/types'

type Difficulty = 'easy' | 'medium' | 'hard'

interface PathStep {
  reaction: Reaction
  targetGroup: FunctionalGroup
}

interface Question {
  sourceGroup: FunctionalGroup
  targetGroup: FunctionalGroup
  path: PathStep[]
}

function buildAdjacency(reactions: Record<string, Reaction>) {
  const adj = new Map<string, Array<{ reactionId: string; targetId: string }>>()
  for (const r of Object.values(reactions)) {
    if (!adj.has(r.sourceGroupId)) adj.set(r.sourceGroupId, [])
    adj.get(r.sourceGroupId)!.push({ reactionId: r.id, targetId: r.targetGroupId })
  }
  return adj
}

function findShortestPath(
  sourceId: string,
  targetId: string,
  adj: Map<string, Array<{ reactionId: string; targetId: string }>>
): string[] | null {
  const queue: Array<{ id: string; path: string[] }> = [{ id: sourceId, path: [] }]
  const visited = new Set<string>([sourceId])

  while (queue.length > 0) {
    const { id, path } = queue.shift()!
    for (const edge of adj.get(id) ?? []) {
      const newPath = [...path, edge.reactionId]
      if (edge.targetId === targetId) return newPath
      if (!visited.has(edge.targetId)) {
        visited.add(edge.targetId)
        queue.push({ id: edge.targetId, path: newPath })
      }
    }
  }
  return null
}

function pathToSteps(
  sourceId: string,
  reactionIds: string[],
  groups: Record<string, FunctionalGroup>,
  reactions: Record<string, Reaction>
): PathStep[] {
  const steps: PathStep[] = []
  let currentId = sourceId
  for (const rid of reactionIds) {
    const reaction = reactions[rid]
    steps.push({ reaction, targetGroup: groups[reaction.targetGroupId] })
    currentId = reaction.targetGroupId
  }
  void currentId
  return steps
}

interface GroupChipProps {
  group: FunctionalGroup
}

function GroupChip({ group }: GroupChipProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-surface border border-border px-4 py-2.5">
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: group.color }} />
      <div>
        <p className="text-sm font-medium text-text-primary">{group.name}</p>
        <p className="text-xs text-text-secondary">{group.formula}</p>
      </div>
    </div>
  )
}

interface ReactionStepProps {
  reaction: Reaction
}

function ReactionStep({ reaction }: ReactionStepProps) {
  return (
    <div className="flex items-start gap-3 pl-5">
      <div className="flex flex-col items-center pt-0.5">
        <ArrowDownIcon className="w-4 h-4 text-blue-400" />
      </div>
      <div>
        <p className="text-xs font-semibold text-blue-400">{reaction.name}</p>
        {reaction.conditions && (
          <p className="text-xs text-text-secondary mt-0.5">{reaction.conditions}</p>
        )}
      </div>
    </div>
  )
}

export function TestModal() {
  const open = useStore((s) => s.testModalOpen)
  const closeTestModal = useStore((s) => s.closeTestModal)
  const groups = useStore((s) => s.groups)
  const reactions = useStore((s) => s.reactions)

  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [question, setQuestion] = useState<Question | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [noResults, setNoResults] = useState(false)

  const handleGenerate = useCallback(() => {
    setRevealed(false)
    setQuestion(null)
    setNoResults(false)

    const groupIds = Object.keys(groups)
    if (groupIds.length < 2) return

    const adj = buildAdjacency(reactions)

    const candidates: Array<{ sourceId: string; targetId: string; path: string[] }> = []

    for (const sourceId of groupIds) {
      for (const targetId of groupIds) {
        if (sourceId === targetId) continue
        const path = findShortestPath(sourceId, targetId, adj)
        if (!path) continue
        const len = path.length
        if (difficulty === 'easy' && len === 1) candidates.push({ sourceId, targetId, path })
        else if (difficulty === 'medium' && len >= 2 && len <= 4) candidates.push({ sourceId, targetId, path })
        else if (difficulty === 'hard') candidates.push({ sourceId, targetId, path })
      }
    }

    if (candidates.length === 0) {
      setNoResults(true)
      return
    }

    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    const steps = pathToSteps(pick.sourceId, pick.path, groups, reactions)
    setQuestion({
      sourceGroup: groups[pick.sourceId],
      targetGroup: groups[pick.targetId],
      path: steps,
    })
  }, [difficulty, groups, reactions])

  const handleClose = () => {
    closeTestModal()
    setQuestion(null)
    setRevealed(false)
    setNoResults(false)
  }

  const handleDifficultyChange = (d: Difficulty) => {
    setDifficulty(d)
    setQuestion(null)
    setRevealed(false)
    setNoResults(false)
  }

  const groupCount = Object.keys(groups).length

  const difficultyConfig = {
    easy: {
      label: 'Easy',
      description: 'Directly connected groups (1 reaction)',
      active: 'bg-green-500/20 text-green-400 border-green-500/40',
    },
    medium: {
      label: 'Medium',
      description: 'Groups 2–4 reactions apart',
      active: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    },
    hard: {
      label: 'Hard',
      description: 'Any two reachable groups',
      active: 'bg-red-500/20 text-red-400 border-red-500/40',
    },
  }

  return (
    <Modal open={open} onClose={handleClose} title="Test Yourself" maxWidth="max-w-xl">
      <div className="flex items-center gap-2 mb-2">
        {(Object.keys(difficultyConfig) as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => handleDifficultyChange(d)}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors border ${
              difficulty === d
                ? difficultyConfig[d].active
                : 'bg-transparent text-text-secondary border-border hover:text-text-primary'
            }`}
          >
            {difficultyConfig[d].label}
          </button>
        ))}
      </div>

      <p className="text-xs text-text-secondary mb-5">{difficultyConfig[difficulty].description}</p>

      {groupCount < 2 ? (
        <p className="text-center text-text-secondary text-sm py-4">
          Add at least 2 functional groups to generate a question.
        </p>
      ) : (
        <Button variant="primary" onClick={handleGenerate} className="w-full mb-5">
          Generate Question
        </Button>
      )}

      <AnimatePresence mode="wait">
        {noResults && (
          <motion.p
            key="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-text-secondary text-sm py-2"
          >
            No {difficulty} pairs found. Try a different difficulty.
          </motion.p>
        )}

        {question && (
          <motion.div
            key="question-block"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <div className="rounded-xl bg-surface-elevated border border-border p-5 mb-4">
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-3">Question</p>
              <p className="text-sm text-text-primary leading-relaxed">
                How do you convert{' '}
                <span className="font-semibold text-blue-400">{question.sourceGroup.name}</span>
                {' '}to{' '}
                <span className="font-semibold text-blue-400">{question.targetGroup.name}</span>?
              </p>
              <p className="text-xs text-text-secondary mt-1.5">
                {question.sourceGroup.formula} → {question.targetGroup.formula}
              </p>
            </div>

            {!revealed ? (
              <Button variant="secondary" onClick={() => setRevealed(true)} className="w-full">
                Reveal Answer
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xs text-text-secondary uppercase tracking-wider mb-3">Answer</p>
                <div className="flex flex-col gap-2.5">
                  <GroupChip group={question.sourceGroup} />
                  {question.path.map((step, i) => (
                    <div key={i} className="flex flex-col gap-2.5">
                      <ReactionStep reaction={step.reaction} />
                      <GroupChip group={step.targetGroup} />
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  onClick={handleGenerate}
                  className="w-full mt-4"
                >
                  Next Question
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
