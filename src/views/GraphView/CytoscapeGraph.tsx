import { useEffect, useRef, useMemo, useCallback } from 'react'
import cytoscape, { type Core } from 'cytoscape'
// @ts-expect-error - no bundled types for cytoscape-dagre
import dagre from 'cytoscape-dagre'
import { useStore, useGroups, useReactions, useStudyMode } from '@/store'
import { buildGraphElements } from './graphTransform'
import { buildGraphStyles } from './graphStyles'
import { GraphControls } from './GraphControls'
import { GraphLegend } from './GraphLegend'

cytoscape.use(dagre)

interface CytoscapeGraphProps {
  onNodeClick: (id: string) => void
  onEdgeClick: (id: string) => void
}

export const LAYOUT_CONFIG = {
  name: 'dagre',
  rankDir: 'LR',
  nodeSep: 80,
  rankSep: 120,
  padding: 40,
  animate: true,
  animationDuration: 400,
  fit: true,
}

export function CytoscapeGraph({ onNodeClick, onEdgeClick }: CytoscapeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const groups = useGroups()
  const reactions = useReactions()
  const studyMode = useStudyMode()
  const openGroupModal = useStore((s) => s.openGroupModal)
  const openReactionModal = useStore((s) => s.openReactionModal)

  const elements = useMemo(
    () => buildGraphElements(groups, reactions, studyMode),
    [groups, reactions, studyMode]
  )

  const stylesheet = useMemo(() => buildGraphStyles(studyMode), [studyMode])

  // Stable callback refs so event handlers always call the latest version
  const onNodeClickRef = useRef(onNodeClick)
  const onEdgeClickRef = useRef(onEdgeClick)
  onNodeClickRef.current = onNodeClick
  onEdgeClickRef.current = onEdgeClick

  // Initialize Cytoscape once on mount
  useEffect(() => {
    if (!containerRef.current) return

    let cy: Core
    try {
      cy = cytoscape({
        container: containerRef.current,
        elements: [],
        style: stylesheet,
        layout: { name: 'preset' },
        wheelSensitivity: 0.3,
        minZoom: 0.2,
        maxZoom: 3,
      })
    } catch (err) {
      console.error('Cytoscape init failed:', err)
      return
    }

    cyRef.current = cy

    cy.on('tap', 'node', (e) => {
      onNodeClickRef.current(e.target.id() as string)
    })
    cy.on('tap', 'edge', (e) => {
      onEdgeClickRef.current(e.target.id() as string)
    })
    cy.on('tap', (e) => {
      if (e.target === cy) {
        useStore.getState().setSelectedNode(null)
      }
    })
    cy.on('dbltap', 'node', (e) => {
      openGroupModal(e.target.id() as string)
    })
    cy.on('dbltap', 'edge', (e) => {
      const edgeId = e.target.id() as string
      const reaction = useStore.getState().reactions[edgeId]
      if (reaction) openReactionModal(reaction.sourceGroupId, edgeId)
    })

    return () => {
      cy.destroy()
      cyRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync elements whenever groups/reactions/studyMode change
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    cy.batch(() => {
      // Add or update nodes/edges
      elements.forEach((el) => {
        const existing = cy.getElementById(el.data.id as string)
        if (existing.length === 0) {
          cy.add(el)
        } else {
          existing.data(el.data)
        }
      })
      // Remove elements no longer in the list
      const ids = new Set(elements.map((el) => el.data.id as string))
      cy.elements().forEach((el) => {
        if (!ids.has(el.id())) el.remove()
      })
    })

    cy.layout(LAYOUT_CONFIG).run()
  }, [elements])

  // Sync stylesheet whenever studyMode changes
  const applyStylesheet = useCallback(() => {
    cyRef.current?.style(stylesheet)
  }, [stylesheet])

  useEffect(() => {
    applyStylesheet()
  }, [applyStylesheet])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} style={{ width: '100%', height: '100%', background: 'transparent' }} />
      <div className="absolute bottom-6 right-4">
        <GraphControls cyRef={cyRef} />
      </div>
      <div className="absolute bottom-6 left-4">
        <GraphLegend />
      </div>
    </div>
  )
}
