import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import type { FunctionalGroup, Reaction } from '@/types'

export type SyncStatus = 'idle' | 'connecting' | 'synced' | 'error' | 'permission-denied'

interface SyncData {
  groups: Record<string, FunctionalGroup>
  reactions: Record<string, Reaction>
  updatedAt: number
}

interface SyncCallbacks {
  onData: (groups: Record<string, FunctionalGroup>, reactions: Record<string, Reaction>) => void
  onStatus: (status: SyncStatus) => void
}

// Prevent Firestore listener from triggering a push back to Firestore
let isApplyingRemoteUpdate = false
let firestoreUnsubscribe: (() => void) | null = null
let storeUnsubscribe: (() => void) | null = null

export async function startSync(
  code: string,
  localGroups: Record<string, FunctionalGroup>,
  localReactions: Record<string, Reaction>,
  callbacks: SyncCallbacks
): Promise<void> {
  stopSync()
  callbacks.onStatus('connecting')

  const ref = doc(db, 'syncs', code)

  try {
    const snapshot = await getDoc(ref)

    if (!snapshot.exists()) {
      // First device with this code — upload local data
      await setDoc(ref, {
        groups: localGroups,
        reactions: localReactions,
        updatedAt: Date.now(),
      })
    } else {
      // Existing code — pull remote data and overwrite local
      const data = snapshot.data() as SyncData
      isApplyingRemoteUpdate = true
      callbacks.onData(data.groups ?? {}, data.reactions ?? {})
      isApplyingRemoteUpdate = false
    }

    // Subscribe to real-time updates from Firestore
    firestoreUnsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) return
        const data = snap.data() as SyncData
        isApplyingRemoteUpdate = true
        callbacks.onData(data.groups ?? {}, data.reactions ?? {})
        isApplyingRemoteUpdate = false
        callbacks.onStatus('synced')
      },
      (err) => {
        callbacks.onStatus(err.code === 'permission-denied' ? 'permission-denied' : 'error')
      }
    )

    callbacks.onStatus('synced')
  } catch (err: unknown) {
    const code = (err as { code?: string }).code
    callbacks.onStatus(code === 'permission-denied' ? 'permission-denied' : 'error')
  }
}

export function stopSync(): void {
  if (firestoreUnsubscribe) {
    firestoreUnsubscribe()
    firestoreUnsubscribe = null
  }
  if (storeUnsubscribe) {
    storeUnsubscribe()
    storeUnsubscribe = null
  }
}

export async function pushData(
  code: string,
  groups: Record<string, FunctionalGroup>,
  reactions: Record<string, Reaction>
): Promise<void> {
  if (isApplyingRemoteUpdate) return
  const ref = doc(db, 'syncs', code)
  await setDoc(ref, { groups, reactions, updatedAt: Date.now() })
}

export function setStoreUnsubscribe(fn: () => void): void {
  storeUnsubscribe = fn
}
