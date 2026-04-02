import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'
import { v4 as uuidv4 } from 'uuid'
import type { AppStore, FunctionalGroup, Reaction } from '@/types'
import { seedGroups, seedReactions } from './seedData'

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      groups: seedGroups,
      reactions: seedReactions,

      activeView: 'graph',
      studyMode: false,
      selectedNodeId: null,
      selectedReactionId: null,
      detailPanelOpen: false,
      groupModalOpen: false,
      groupModalEditId: null,
      reactionModalOpen: false,
      reactionModalSourceId: null,
      reactionModalEditId: null,
      deleteConfirmId: null,
      deleteConfirmType: null,

      addGroup: (group: Omit<FunctionalGroup, 'id' | 'createdAt'>) => {
        const id = uuidv4()
        set((s) => ({
          groups: { ...s.groups, [id]: { ...group, id, createdAt: Date.now() } },
        }))
      },

      updateGroup: (id: string, patch: Partial<FunctionalGroup>) => {
        set((s) => ({
          groups: { ...s.groups, [id]: { ...s.groups[id], ...patch } },
        }))
      },

      deleteGroup: (id: string) => {
        set((s) => {
          const groups = { ...s.groups }
          delete groups[id]
          const reactions = Object.fromEntries(
            Object.entries(s.reactions).filter(
              ([, r]) => r.sourceGroupId !== id && r.targetGroupId !== id
            )
          )
          return {
            groups,
            reactions,
            selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
            detailPanelOpen: s.selectedNodeId === id ? false : s.detailPanelOpen,
          }
        })
      },

      addReaction: (reaction: Omit<Reaction, 'id' | 'createdAt' | 'hasMechanism'>) => {
        const id = uuidv4()
        set((s) => ({
          reactions: {
            ...s.reactions,
            [id]: {
              ...reaction,
              id,
              hasMechanism: reaction.mechanism.length > 0,
              createdAt: Date.now(),
            },
          },
        }))
      },

      updateReaction: (id: string, patch: Partial<Omit<Reaction, 'hasMechanism'>>) => {
        set((s) => {
          const existing = s.reactions[id]
          const updated = { ...existing, ...patch }
          return {
            reactions: {
              ...s.reactions,
              [id]: { ...updated, hasMechanism: updated.mechanism.length > 0 },
            },
          }
        })
      },

      deleteReaction: (id: string) => {
        set((s) => {
          const reactions = { ...s.reactions }
          delete reactions[id]
          return {
            reactions,
            selectedReactionId: s.selectedReactionId === id ? null : s.selectedReactionId,
            detailPanelOpen: s.selectedReactionId === id ? false : s.detailPanelOpen,
          }
        })
      },

      setActiveView: (view) => set({ activeView: view }),
      setStudyMode: (enabled) => set({ studyMode: enabled }),

      setSelectedNode: (id) => {
        set({
          selectedNodeId: id,
          selectedReactionId: null,
          detailPanelOpen: id !== null,
        })
      },

      setSelectedReaction: (id) => {
        set({
          selectedReactionId: id,
          selectedNodeId: null,
          detailPanelOpen: id !== null,
        })
      },

      openGroupModal: (editId?: string) => {
        set({ groupModalOpen: true, groupModalEditId: editId ?? null })
      },

      closeGroupModal: () => set({ groupModalOpen: false, groupModalEditId: null }),

      openReactionModal: (sourceId: string, editId?: string) => {
        set({
          reactionModalOpen: true,
          reactionModalSourceId: sourceId,
          reactionModalEditId: editId ?? null,
        })
      },

      closeReactionModal: () =>
        set({ reactionModalOpen: false, reactionModalSourceId: null, reactionModalEditId: null }),

      openDeleteConfirm: (id, type) =>
        set({ deleteConfirmId: id, deleteConfirmType: type }),

      closeDeleteConfirm: () => set({ deleteConfirmId: null, deleteConfirmType: null }),

      // Selector helpers (not persisted)
      ...({} as object),
    }),
    {
      name: 'ochem-storage',
      version: 1,
      partialize: (state) => ({
        groups: state.groups,
        reactions: state.reactions,
      }),
    }
  )
)

// Convenience selector hooks
export const useGroups = () => useStore((s) => s.groups)
export const useReactions = () => useStore((s) => s.reactions)
export const useStudyMode = () => useStore((s) => s.studyMode)
export const useActiveView = () => useStore((s) => s.activeView)

export const useGroupsArray = () =>
  useStore(useShallow((s) => Object.values(s.groups).sort((a, b) => a.createdAt - b.createdAt)))

export const useReactionsForGroup = (groupId: string) =>
  useStore(useShallow((s) =>
    Object.values(s.reactions)
      .filter((r) => r.sourceGroupId === groupId)
      .sort((a, b) => a.createdAt - b.createdAt)
  ))

export const useSelectedGroup = () =>
  useStore((s) => (s.selectedNodeId ? s.groups[s.selectedNodeId] : null))

export const useSelectedReaction = () =>
  useStore((s) => (s.selectedReactionId ? s.reactions[s.selectedReactionId] : null))

export const useGroupDeleteWarning = (groupId: string) =>
  useStore((s) =>
    Object.values(s.reactions).filter(
      (r) => r.sourceGroupId === groupId || r.targetGroupId === groupId
    ).length
  )
