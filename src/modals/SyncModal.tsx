import { useState, useCallback } from 'react'
import {
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { useStore } from '@/store'
import type { SyncStatus } from '@/types'

interface SyncModalProps {
  onStart: (code: string) => Promise<void>
  onStop: () => void
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${segment()}-${segment()}`
}

function StatusBadge({ status }: { status: SyncStatus }) {
  if (status === 'connecting') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-400">
        <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
        Connecting…
      </span>
    )
  }
  if (status === 'synced') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-green-400">
        <CheckCircleIcon className="w-3.5 h-3.5" />
        Synced
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-400">
        <ExclamationTriangleIcon className="w-3.5 h-3.5" />
        Connection error
      </span>
    )
  }
  if (status === 'permission-denied') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-400">
        <ExclamationTriangleIcon className="w-3.5 h-3.5" />
        Permission denied — Firestore rules not deployed
      </span>
    )
  }
  return null
}

export function SyncModal({ onStart, onStop }: SyncModalProps) {
  const syncCode = useStore((s) => s.syncCode)
  const syncStatus = useStore((s) => s.syncStatus)
  const syncModalOpen = useStore((s) => s.syncModalOpen)
  const closeSyncModal = useStore((s) => s.closeSyncModal)

  const [inputCode, setInputCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [inputError, setInputError] = useState('')

  const handleGenerate = useCallback(async () => {
    const code = generateCode()
    setLoading(true)
    await onStart(code)
    setLoading(false)
  }, [onStart])

  const handleConnect = useCallback(async () => {
    const code = inputCode.trim().toUpperCase()
    if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
      setInputError('Enter a valid code like ABCD-1234')
      return
    }
    setInputError('')
    setLoading(true)
    await onStart(code)
    setLoading(false)
    setInputCode('')
  }, [inputCode, onStart])

  const handleCopy = useCallback(() => {
    if (!syncCode) return
    navigator.clipboard.writeText(syncCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [syncCode])

  const handleStop = useCallback(() => {
    onStop()
  }, [onStop])

  return (
    <Modal open={syncModalOpen} onClose={closeSyncModal} title="Cross-Device Sync" maxWidth="max-w-md">
      {syncCode ? (
        // Active sync view
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Status</span>
            <StatusBadge status={syncStatus} />
          </div>

          <div>
            <p className="text-xs text-text-secondary mb-2">Your sync code</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-bg border border-border rounded-lg px-4 py-3 font-mono text-xl font-bold tracking-widest text-text-primary text-center select-all">
                {syncCode}
              </div>
              <button
                onClick={handleCopy}
                className="p-3 rounded-lg border border-border bg-surface hover:bg-surface-elevated transition-colors text-text-secondary hover:text-text-primary"
                title="Copy to clipboard"
              >
                {copied ? (
                  <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-400" />
                ) : (
                  <ClipboardDocumentIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            Enter this code on any other device to sync your data in real time. Changes on any
            device will appear on all connected devices.
          </p>

          <div className="pt-1 border-t border-border">
            <Button variant="danger" size="sm" onClick={handleStop}>
              Stop syncing
            </Button>
          </div>
        </div>
      ) : (
        // Setup view
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <CloudArrowUpIcon className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              Generate a sync code on this device, then enter it on any other device to keep your
              data in sync automatically.
            </p>
          </div>

          {/* Generate new code */}
          <div className="space-y-2">
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : null}
              Generate new sync code
            </Button>
            <p className="text-xs text-text-secondary text-center">
              Start fresh — your local data will be uploaded
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-secondary">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Enter existing code */}
          <div className="space-y-2">
            <Input
              label="Enter existing sync code"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value)
                setInputError('')
              }}
              placeholder="ABCD-1234"
              className="font-mono tracking-widest uppercase"
            />
            {inputError && (
              <p className="text-xs text-red-400">{inputError}</p>
            )}
            <p className="text-xs text-amber-400/80">
              Warning: connecting to an existing code will replace your local data with the synced
              data.
            </p>
            <Button
              variant="secondary"
              className="w-full justify-center"
              onClick={handleConnect}
              disabled={loading || !inputCode.trim()}
            >
              Connect
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
