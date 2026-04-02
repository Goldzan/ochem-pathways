import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TopBar } from './components/TopBar'
import { ListView } from './views/ListView'
import { GraphView } from './views/GraphView'
import { GroupModal } from './modals/GroupModal'
import { ReactionModal } from './modals/ReactionModal'
import { DeleteConfirmModal } from './modals/DeleteConfirmModal'
import { DetailPanel } from './panels/DetailPanel'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useStore, useActiveView, useStudyMode } from './store'

function StudyModeBanner() {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-center text-xs text-amber-400 font-medium"
    >
      Study Mode active — reaction conditions are hidden
    </motion.div>
  )
}

function App() {
  const activeView = useActiveView()
  const studyMode = useStudyMode()
  const setStudyMode = useStore((s) => s.setStudyMode)
  const setActiveView = useStore((s) => s.setActiveView)
  const setSelectedNode = useStore((s) => s.setSelectedNode)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 's' || e.key === 'S') setStudyMode(!studyMode)
      if (e.key === 'g' || e.key === 'G') setActiveView('graph')
      if (e.key === 'l' || e.key === 'L') setActiveView('list')
      if (e.key === 'Escape') setSelectedNode(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [studyMode, setStudyMode, setActiveView, setSelectedNode])

  return (
    <ErrorBoundary>
    <div className="flex flex-col h-full">
      <TopBar />
      <AnimatePresence>
        {studyMode && <StudyModeBanner key="banner" />}
      </AnimatePresence>

      <div className="flex-1 relative flex overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <ListView />
            </motion.div>
          ) : (
            <motion.div
              key="graph"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <GraphView />
            </motion.div>
          )}
        </AnimatePresence>

        <DetailPanel />
      </div>

      <GroupModal />
      <ReactionModal />
      <DeleteConfirmModal />
    </div>
    </ErrorBoundary>
  )
}

export default App
