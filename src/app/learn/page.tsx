import type { Metadata } from 'next'
import { Beaker, Heart, Leaf, Brain, Zap, Coffee } from 'lucide-react'
import { Suspense } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export const metadata: Metadata = {
  title: 'Tea Guide | Learn About Loaded Tea | Loaded Tea Finder',
  description: 'Learn everything about loaded teas: what they are, their benefits, popular varieties, and how they\'re made. Your comprehensive guide to the world of loaded teas.',
  keywords: 'loaded tea, loaded tea guide, nutrition drinks, healthy energy drinks, tea benefits, loaded tea ingredients',
  openGraph: {
    title: 'Loaded Tea Guide - Learn About Loaded Tea',
    description: 'Discover the world of loaded teas and their amazing benefits.',
    type: 'website',
  },
}

const teaGuides = [
  {
    title: 'What is Loaded Tea?',
    description: 'Loaded teas are specialty drinks that combine various supplements and ingredients to create a refreshing, energizing beverage. Unlike traditional teas, loaded teas are crafted with a focus on both taste and functional benefits.',
    icon: Beaker,
  },
  {
    title: 'Health Benefits',
    description: 'Loaded teas often contain ingredients that support metabolism, provide sustained energy, and may aid in focus and concentration. Many varieties are sugar-free and low in calories.',
    icon: Heart,
  },
  {
    title: 'Key Ingredients',
    description: 'Common ingredients include green tea extract, aloe, vitamins, minerals, and natural caffeine sources. Each ingredient is carefully selected for its specific benefits.',
    icon: Leaf,
  },
  {
    title: 'Mental Clarity',
    description: 'Many loaded teas contain nootropic ingredients that may help improve focus, mental clarity, and cognitive function throughout the day.',
    icon: Brain,
  },
  {
    title: 'Energy Boost',
    description: 'Unlike traditional energy drinks, loaded teas provide clean energy without the crash. The combination of natural caffeine and vitamins helps sustain energy levels.',
    icon: Zap,
  },
  {
    title: 'Popular Varieties',
    description: 'From tropical fruit flavors to classic combinations, loaded teas come in countless varieties. Each nutrition club often creates their own unique signature drinks.',
    icon: Coffee,
  },
]

export default function LearnPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <section className="mb-16 text-center">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
          Your Guide to Loaded Teas
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover the world of loaded teas - a perfect blend of taste, energy, and wellness.
          Learn about their benefits, ingredients, and what makes them special.
        </p>
      </section>

      <Suspense fallback={<LoadingSpinner />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teaGuides.map((guide) => (
            <div 
              key={guide.title}
              className="p-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200 hover:border-teal-500/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/10 to-blue-500/10 flex items-center justify-center mb-6">
                <guide.icon className="w-6 h-6 text-teal-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {guide.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {guide.description}
              </p>
            </div>
          ))}
        </div>
      </Suspense>

      <section className="mt-24 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Try a Loaded Tea?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Find a nutrition club near you and experience these amazing drinks yourself!
        </p>
        <a 
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity"
        >
          Find a Location
        </a>
      </section>
    </main>
  )
}
