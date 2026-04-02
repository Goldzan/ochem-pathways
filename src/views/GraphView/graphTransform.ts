import type { ElementDefinition } from 'cytoscape'
import type { FunctionalGroup, Reaction } from '@/types'

export function buildGraphElements(
  groups: Record<string, FunctionalGroup>,
  reactions: Record<string, Reaction>,
  studyMode: boolean
): ElementDefinition[] {
  const nodes: ElementDefinition[] = Object.values(groups).map((group) => ({
    data: {
      id: group.id,
      label: `${group.name}${group.formula ? `\n${group.formula}` : ''}`,
      color: group.color,
      name: group.name,
      formula: group.formula,
    },
  }))

  const edges: ElementDefinition[] = Object.values(reactions).map((reaction) => ({
    data: {
      id: reaction.id,
      source: reaction.sourceGroupId,
      target: reaction.targetGroupId,
      label: studyMode ? '' : reaction.conditions,
      name: reaction.name,
      hasMechanism: reaction.hasMechanism,
    },
  }))

  return [...nodes, ...edges]
}
