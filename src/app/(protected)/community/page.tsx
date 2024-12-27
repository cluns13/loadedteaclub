import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { authOptions } from '@/lib/auth/auth'

export const metadata: Metadata = {
  title: 'Tea Society Community | Loaded Tea Finder',
  description: 'Join our tea-loving community. Share experiences, discover new teas, and connect with fellow tea enthusiasts.',
  keywords: 'tea community, tea society, tea enthusiasts, tea discussions, tea sharing',
  openGraph: {
    title: 'Join Our Tea Society',
    description: 'Connect with fellow tea enthusiasts and share your tea journey.',
    type: 'website',
  },
}

export default async function CommunityPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login?callbackUrl=/community')
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Tea Society
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Connect with fellow tea enthusiasts and share your tea journey.
        </p>
      </section>

      <Suspense fallback={<LoadingSpinner />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Community features will be loaded here */}
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Community Coming Soon</h2>
            <p className="text-gray-600">
              Our tea community features are being developed. Soon you'll be able to connect with fellow tea enthusiasts!
            </p>
          </div>
        </div>
      </Suspense>
    </main>
  )
}
