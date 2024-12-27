'use client'

import { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { teaTypes } from '@/lib/validations/tea'

interface TeaSearchProps {
  onSearch: (search: string) => void
  onTypeFilter: (type: string | null) => void
}

export default function TeaSearch({ onSearch, onTypeFilter }: TeaSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    onSearch(debouncedSearch)
  }, [debouncedSearch, onSearch])

  const handleTypeChange = (type: string | null) => {
    setSelectedType(type)
    onTypeFilter(type)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search teas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => handleTypeChange(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedType === null
              ? 'bg-teal-400 text-white'
              : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
          }`}
        >
          All
        </button>
        {teaTypes.map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedType === type
                ? 'bg-teal-400 text-white'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
            }`}
          >
            {type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
