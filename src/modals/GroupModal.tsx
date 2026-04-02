import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { Modal } from '@/components/shared/Modal'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { ColorPicker } from '@/components/shared/ColorPicker'
import { ImageUpload } from '@/components/shared/ImageUpload'

export function GroupModal() {
  const groupModalOpen = useStore((s) => s.groupModalOpen)
  const groupModalEditId = useStore((s) => s.groupModalEditId)
  const groups = useStore((s) => s.groups)
  const closeGroupModal = useStore((s) => s.closeGroupModal)
  const addGroup = useStore((s) => s.addGroup)
  const updateGroup = useStore((s) => s.updateGroup)

  const [name, setName] = useState('')
  const [formula, setFormula] = useState('')
  const [color, setColor] = useState('#60a5fa')
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined)

  const isEdit = groupModalEditId !== null
  const editGroup = isEdit ? groups[groupModalEditId] : null

  useEffect(() => {
    if (groupModalOpen) {
      if (editGroup) {
        setName(editGroup.name)
        setFormula(editGroup.formula)
        setColor(editGroup.color)
        setImageDataUrl(editGroup.imageDataUrl)
      } else {
        setName('')
        setFormula('')
        setColor('#60a5fa')
        setImageDataUrl(undefined)
      }
    }
  }, [groupModalOpen, editGroup])

  const handleSubmit = () => {
    if (!name.trim()) return
    if (isEdit && groupModalEditId) {
      updateGroup(groupModalEditId, { name: name.trim(), formula: formula.trim(), color, imageDataUrl })
    } else {
      addGroup({ name: name.trim(), formula: formula.trim(), color, imageDataUrl })
    }
    closeGroupModal()
  }

  return (
    <Modal
      open={groupModalOpen}
      onClose={closeGroupModal}
      title={isEdit ? 'Edit Functional Group' : 'Add Functional Group'}
    >
      <div className="space-y-4">
        <Input
          label="Name"
          placeholder="e.g. Alkene, Alcohol, Aldehyde"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <Input
          label="Formula (optional)"
          placeholder="e.g. R-CH=CH₂"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
        />
        <ColorPicker label="Node Color" value={color} onChange={setColor} />
        <ImageUpload
          label="Structure Image (optional)"
          imageDataUrl={imageDataUrl}
          onUpload={setImageDataUrl}
          onClear={() => setImageDataUrl(undefined)}
        />
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="ghost" onClick={closeGroupModal}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!name.trim()}>
            {isEdit ? 'Save Changes' : 'Add Group'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
