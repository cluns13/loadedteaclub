'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Star, MapPin } from 'lucide-react'
import { Tea } from '@prisma/client'

interface TeaCardProps {
  tea: Tea & {
    _count?: {
      reviews: number
      favoritedBy: number
    }
  }
}

export default function TeaCard({ tea }: TeaCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <Link href={`/teas/${tea.id}`}>
        <div className="relative h-56 w-full">
          {tea.imageUrl ? (
            <Image
              src={tea.imageUrl}
              alt={tea.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-teal-600 shadow-sm border border-teal-100">
            {tea.type}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-teal-100 opacity-50 group-hover:opacity-75 transition-opacity rounded-2xl -z-10"></div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-teal-500 transition-colors">
            {tea.name}
          </h3>
          
          <p className="text-base text-gray-600 line-clamp-2 mb-4 font-light">
            {tea.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {tea._count && (
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{tea._count.reviews}</span>
                </div>
              )}
              {tea._count && (
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <span className="font-medium">{tea._count.favoritedBy}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">2.4 mi</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
