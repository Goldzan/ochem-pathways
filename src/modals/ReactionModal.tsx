import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { PlusIcon, TrashIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useStore } from '@/store'
import { Modal } from '@/components/shared/Modal'
import { Input } from '@/components/shared/Input'
import { Textarea } from '@/components/shared/Textarea'
import { Button } from '@/components/shared/Button'
import { IconButton } from '@/components/shared/IconButton'
import { ImageUpload } from '@/components/shared/ImageUpload'
import type { MechanismStep } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

export function ReactionModal() {
  const reactionModalOpen = useStore((s) => s.reactionModalOpen)
  const reactionModalSourceId = useStore((s) => s.reactionModalSourceId)
  const reactionModalEditId = useStore((s) => s.reactionModalEditId)
  const groups = useStore((s) => s.groups)
  const reactions = useStore((s) => s.reactions)
  const closeReactionModal = useStore((s) => s.closeReactionModal)
  const addReaction = useStore((s) => s.addReaction)
  const updateReaction = useStore((s) => s.updateReaction)

  const [name, setName] = useState('')
  const [targetGroupId, setTargetGroupId] = useState('')
  const [conditions, setConditions] = useState('')
  const [steps, setSteps] = useState<MechanismStep[]>([])
  const [mechanismOpen, setMechanismOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = reactionModalEditId !== null
  const editReaction = isEdit ? reactions[reactionModalEditId ?? ''] : null
  const sourceGroup = reactionModalSourceId ? groups[reactionModalSourceId] : null
  const otherGroups = Object.values(groups).filter((g) => g.id !== reactionModalSourceId)

  useEffect(() => {
    if (reactionModalOpen) {
      if (editReaction) {
        setName(editReaction.name)
        setTargetGroupId(editReaction.targetGroupId)
        setConditions(editReaction.conditions)
        setSteps(editReaction.mechanism.map((s) => ({ ...s })))
        setMechanismOpen(editReaction.mechanism.length > 0)
      } else {
        setName('')
        setTargetGroupId(otherGroups[0]?.id ?? '')
        setConditions('')
        setSteps([])
        setMechanismOpen(false)
      }
      setErrors({})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactionModalOpen])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Required'
    if (!targetGroupId) errs.target = 'Select a product group'
    if (!conditions.trim()) errs.conditions = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate() || !reactionModalSourceId) return
    const orderedSteps = steps.map((s, i) => ({ ...s, order: i + 1 }))
    if (isEdit && reactionModalEditId) {
      updateReaction(reactionModalEditId, {
        name: name.trim(),
        targetGroupId,
        conditions: conditions.trim(),
        mechanism: orderedSteps,
      })
    } else {
      addReaction({
        sourceGroupId: reactionModalSourceId,
        targetGroupId,
        name: name.trim(),
        conditions: conditions.trim(),
        mechanism: orderedSteps,
      })
    }
    closeReactionModal()
  }

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { id: uuidv4(), order: prev.length + 1, description: '', reagent: '', curlyArrowNote: '' },
    ])
  }

  const updateStep = (id: string, patch: Partial<MechanismStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id))
  }


  return (
    <Modal
      open={reactionModalOpen}
      onClose={closeReactionModal}
      title={isEdit ? 'Edit Reaction' : 'Add Reaction'}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Source info */}
        <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-lg border border-border text-sm">
          <span className="text-text-secondary">From:</span>
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: sourceGroup?.color }}
          />
          <span className="font-medium text-text-primary">{sourceGroup?.name}</span>
        </div>

        <Input
          label="Reaction Name"
          placeholder="e.g. Hydrohalogenation, Fischer Esterification"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoFocus
        />

        {/* Target group */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Product (Target Group)
          </label>
          {otherGroups.length === 0 ? (
            <p className="text-xs text-red-400 py-2">
              Add at least one other functional group first.
            </p>
          ) : (
            <select
              value={targetGroupId}
              onChange={(e) => setTargetGroupId(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {otherGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}{g.formula ? ` (${g.formula})` : ''}
                </option>
              ))}
            </select>
          )}
          {errors.target && <p className="text-xs text-red-400">{errors.target}</p>}
        </div>

        <Textarea
          label="Reaction Conditions"
          placeholder="e.g. HBr, no peroxides, room temperature"
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
          error={errors.conditions}
        />

        {/* Mechanism section */}
        <div className="border border-border/60 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setMechanismOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-primary hover:bg-white/4 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Mechanism Steps
              {steps.length > 0 && (
                <span className="text-xs text-purple-400 font-normal">({steps.length} step{steps.length !== 1 ? 's' : ''})</span>
              )}
            </span>
            <ChevronDownIcon
              className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${mechanismOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {mechanismOpen && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3 border-t border-border/60 pt-3">
                  <AnimatePresence>
                    {steps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        className="space-y-2 bg-surface/50 rounded-lg p-3 border border-border/50"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-purple-400">Step {index + 1}</span>
                          <IconButton label="Remove step" variant="danger" onClick={() => removeStep(step.id)}>
                            <TrashIcon className="w-3.5 h-3.5" />
                          </IconButton>
                        </div>
                        <Textarea
                          placeholder="Describe what happens in this step..."
                          value={step.description}
                          onChange={(e) => updateStep(step.id, { description: e.target.value })}
                          rows={2}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Reagent (optional)"
                            value={step.reagent ?? ''}
                            onChange={(e) => updateStep(step.id, { reagent: e.target.value })}
                          />
                          <Input
                            placeholder="Curly arrow note"
                            value={step.curlyArrowNote ?? ''}
                            onChange={(e) => updateStep(step.id, { curlyArrowNote: e.target.value })}
                          />
                        </div>
                        <ImageUpload
                          imageDataUrl={step.imageDataUrl}
                          onUpload={(dataUrl) => updateStep(step.id, { imageDataUrl: dataUrl })}
                          onClear={() => updateStep(step.id, { imageDataUrl: undefined })}
                          maxHeightClass="max-h-36"
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center border border-dashed border-purple-500/30 hover:border-purple-400/60 hover:text-purple-400"
                    onClick={addStep}
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    Add Step
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <Button variant="ghost" onClick={closeReactionModal}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={otherGroups.length === 0}
          >
            {isEdit ? 'Save Changes' : 'Add Reaction'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
