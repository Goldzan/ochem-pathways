import { MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon, ArrowsPointingOutIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { IconButton } from '@/components/shared/IconButton'
import type { Core } from 'cytoscape'
import { LAYOUT_CONFIG } from './CytoscapeGraph'

interface GraphControlsProps {
  cyRef: React.RefObject<Core | null>
}

export function GraphControls({ cyRef }: GraphControlsProps) {
  const handleZoomIn = () => cyRef.current?.zoom({ level: (cyRef.current.zoom() ?? 1) * 1.25, renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 } })
  const handleZoomOut = () => cyRef.current?.zoom({ level: (cyRef.current.zoom() ?? 1) * 0.8, renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 } })
  const handleFit = () => cyRef.current?.fit(undefined, 40)
  const handleRedistribute = () => cyRef.current?.layout(LAYOUT_CONFIG).run()

  return (
    <div className="flex flex-col gap-1 bg-surface/90 backdrop-blur-sm border border-border rounded-xl p-1">
      <IconButton label="Zoom in" onClick={handleZoomIn} className="hover:bg-white/10">
        <MagnifyingGlassPlusIcon className="w-4 h-4" />
      </IconButton>
      <div className="h-px bg-border mx-1" />
      <IconButton label="Zoom out" onClick={handleZoomOut} className="hover:bg-white/10">
        <MagnifyingGlassMinusIcon className="w-4 h-4" />
      </IconButton>
      <div className="h-px bg-border mx-1" />
      <IconButton label="Fit to screen" onClick={handleFit} className="hover:bg-white/10">
        <ArrowsPointingOutIcon className="w-4 h-4" />
      </IconButton>
      <div className="h-px bg-border mx-1" />
      <IconButton label="Redistribute layout" onClick={handleRedistribute} className="hover:bg-white/10">
        <ArrowPathIcon className="w-4 h-4" />
      </IconButton>
    </div>
  )
}
