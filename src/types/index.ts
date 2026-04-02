export interface FunctionalGroup {
  id: string
  name: string
  formula: string
  color: string
  imageDataUrl?: string
  createdAt: number
}

export interface MechanismStep {
  id: string
  order: number
  description: string
  reagent?: string
  curlyArrowNote?: string
  imageDataUrl?: string
}

export interface Reaction {
  id: string
  sourceGroupId: string
  targetGroupId: string
  name: string
  conditions: string
  mechanism: MechanismStep[]
  hasMechanism: boolean
  createdAt: number
}

export type ActiveView = 'list' | 'graph'

export type SyncStatus = 'idle' | 'connecting' | 'synced' | 'error' | 'permission-denied'

export interface AppStore {
  groups: Record<string, FunctionalGroup>
  reactions: Record<string, Reaction>

  activeView: ActiveView
  studyMode: boolean
  selectedNodeId: string | null
  selectedReactionId: string | null
  detailPanelOpen: boolean
  groupModalOpen: boolean
  groupModalEditId: string | null
  reactionModalOpen: boolean
  reactionModalSourceId: string | null
  reactionModalEditId: string | null
  deleteConfirmId: string | null
  deleteConfirmType: 'group' | 'reaction' | null

  syncCode: string | null
  syncStatus: SyncStatus
  syncModalOpen: boolean

  addGroup: (group: Omit<FunctionalGroup, 'id' | 'createdAt'>) => void
  updateGroup: (id: string, patch: Partial<FunctionalGroup>) => void
  deleteGroup: (id: string) => void

  addReaction: (reaction: Omit<Reaction, 'id' | 'createdAt' | 'hasMechanism'>) => void
  updateReaction: (id: string, patch: Partial<Omit<Reaction, 'hasMechanism'>>) => void
  deleteReaction: (id: string) => void

  setActiveView: (view: ActiveView) => void
  setStudyMode: (enabled: boolean) => void
  setSelectedNode: (id: string | null) => void
  setSelectedReaction: (id: string | null) => void
  openGroupModal: (editId?: string) => void
  closeGroupModal: () => void
  openReactionModal: (sourceId: string, editId?: string) => void
  closeReactionModal: () => void
  openDeleteConfirm: (id: string, type: 'group' | 'reaction') => void
  closeDeleteConfirm: () => void

  setSyncCode: (code: string | null) => void
  setSyncStatus: (status: SyncStatus) => void
  openSyncModal: () => void
  closeSyncModal: () => void
  loadDataFromSync: (groups: Record<string, FunctionalGroup>, reactions: Record<string, Reaction>) => void
}
