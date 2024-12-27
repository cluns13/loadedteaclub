'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import { Loader2 } from 'lucide-react';
import { LiquidBackground } from '@/components/LiquidBackground';
import { FloatingElements } from '@/components/FloatingElements';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-[100svh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#24C6DC]" />
      </div>
    );
  }

  if (!session) {
    return null; // We'll redirect in useEffect
  }

  return (
    <div className="min-h-[100svh] relative overflow-hidden">
      <LiquidBackground />
      <FloatingElements />

      <main className="relative min-h-[100svh] pt-8 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-4 mb-6">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt=""
                  className="h-16 w-16 rounded-full border-2 border-white/20 shadow-xl"
                />
              )}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  Welcome back
                </h1>
                <p className="text-xl text-white/80 mt-2">
                  {session.user?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="relative transform hover:scale-[1.01] transition-transform duration-500">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-xl rounded-3xl" />
            <div className="relative rounded-3xl overflow-hidden">
              <DashboardTabs />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
