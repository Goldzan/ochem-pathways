import { useRef, useEffect, useCallback } from 'react'
import { PhotoIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface ImageUploadProps {
  imageDataUrl?: string
  onUpload: (dataUrl: string) => void
  onClear: () => void
  label?: string
  maxHeightClass?: string
}

export function ImageUpload({
  imageDataUrl,
  onUpload,
  onClear,
  label,
  maxHeightClass = 'max-h-48',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) onUpload(e.target.result as string)
      }
      reader.readAsDataURL(file)
    },
    [onUpload]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  // Global paste listener — captures Ctrl+V anywhere while mounted
  useEffect(() => {
    const listener = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            processFile(file)
            e.preventDefault()
          }
          break
        }
      }
    }
    document.addEventListener('paste', listener)
    return () => document.removeEventListener('paste', listener)
  }, [processFile])

  if (imageDataUrl) {
    return (
      <div>
        {label && (
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
            {label}
          </p>
        )}
        <div className="relative group/img">
          <img
            src={imageDataUrl}
            alt="Uploaded diagram"
            className={`w-full rounded-lg border border-border/50 object-contain ${maxHeightClass}`}
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-1 right-1 opacity-0 group-hover/img:opacity-100 transition-opacity text-red-400 hover:text-red-300"
            aria-label="Remove image"
          >
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {label && (
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
          {label}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-border/60 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:border-border transition-colors"
      >
        <PhotoIcon className="w-4 h-4 flex-shrink-0" />
        <span>
          Click to select &nbsp;·&nbsp;{' '}
          <kbd className="font-sans px-1 py-0.5 bg-surface rounded border border-border/60 text-text-secondary/80">
            Ctrl+V
          </kbd>{' '}
          to paste
        </span>
      </button>
    </div>
  )
}
