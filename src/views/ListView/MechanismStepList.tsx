import { motion } from 'framer-motion'
import type { MechanismStep } from '@/types'
import { useStudyMode } from '@/store'

interface MechanismStepListProps {
  steps: MechanismStep[]
}

export function MechanismStepList({ steps }: MechanismStepListProps) {
  const studyMode = useStudyMode()
  const sorted = [...steps].sort((a, b) => a.order - b.order)

  return (
    <div className="mt-3 space-y-2 pl-4 border-l-2 border-purple-500/30">
      <p className="text-xs font-medium text-purple-400 uppercase tracking-wider mb-2">Mechanism Steps</p>
      {sorted.map((step) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-3"
        >
          <span className="flex-shrink-0 w-5 h-5 bg-purple-500/20 text-purple-400 rounded-full text-xs flex items-center justify-center font-semibold">
            {step.order}
          </span>
          <div className="flex-1 min-w-0">
            {studyMode ? (
              <div className="h-4 bg-surface rounded animate-pulse w-3/4" />
            ) : (
              <p className="text-xs text-text-primary leading-relaxed">{step.description}</p>
            )}
            {!studyMode && step.reagent && (
              <p className="text-xs text-text-secondary mt-0.5">Reagent: <span className="text-blue-400">{step.reagent}</span></p>
            )}
            {!studyMode && step.curlyArrowNote && (
              <p className="text-xs text-text-secondary/70 mt-0.5 italic">{step.curlyArrowNote}</p>
            )}
            {!studyMode && step.imageDataUrl && (
              <img
                src={step.imageDataUrl}
                alt={`Step ${step.order} diagram`}
                className="mt-1.5 rounded-lg border border-border/40 object-contain max-h-36 w-full"
              />
            )}
            {studyMode && step.imageDataUrl && (
              <div className="mt-1.5 h-24 bg-surface rounded-lg animate-pulse" />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
