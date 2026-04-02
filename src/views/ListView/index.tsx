import { AnimatePresence } from 'framer-motion'
import { useGroupsArray } from '@/store'
import { GroupCard } from './GroupCard'
import { EmptyState } from './EmptyState'

export function ListView() {
  const groups = useGroupsArray()

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {groups.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence mode="popLayout">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
