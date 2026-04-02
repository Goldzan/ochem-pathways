import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useStore, useStudyMode } from '@/store'
import { motion } from 'framer-motion'

export function StudyModeToggle() {
  const studyMode = useStudyMode()
  const setStudyMode = useStore((s) => s.setStudyMode)

  return (
    <button
      onClick={() => setStudyMode(!studyMode)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
        studyMode
          ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
          : 'bg-surface border-border text-text-secondary hover:text-text-primary hover:border-text-secondary/30'
      }`}
    >
      <motion.div
        key={studyMode ? 'hide' : 'show'}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {studyMode ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
      </motion.div>
      Study Mode
    </button>
  )
}
