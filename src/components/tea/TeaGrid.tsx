'use client'

import { Tea } from '@prisma/client'
import TeaCard from './TeaCard'

interface TeaGridProps {
  teas: Array<Tea & {
    _count?: {
      reviews: number
      favoritedBy: number
    }
  }>
  emptyMessage?: string
}

export default function TeaGrid({ 
  teas, 
  emptyMessage = 'No teas found' 
}: TeaGridProps) {
  if (teas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {teas.map((tea) => (
        <TeaCard key={tea.id} tea={tea} />
      ))}
    </div>
  )
}
