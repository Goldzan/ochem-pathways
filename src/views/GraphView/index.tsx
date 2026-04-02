import { useStore, useGroupsArray } from '@/store'
import { CytoscapeGraph } from './CytoscapeGraph'
import { EmptyState } from '../ListView/EmptyState'
import { PlusCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/shared/Button'

export function GraphView() {
  const groups = useGroupsArray()
  const setSelectedNode = useStore((s) => s.setSelectedNode)
  const setSelectedReaction = useStore((s) => s.setSelectedReaction)
  const openGroupModal = useStore((s) => s.openGroupModal)

  if (groups.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      <CytoscapeGraph
        onNodeClick={(id) => setSelectedNode(id)}
        onEdgeClick={(id) => setSelectedReaction(id)}
      />
      {/* Floating add button for graph view */}
      <div className="absolute top-4 right-4">
        <Button variant="primary" size="sm" onClick={() => openGroupModal()}>
          <PlusCircleIcon className="w-4 h-4" />
          Add Group
        </Button>
      </div>
    </div>
  )
}
