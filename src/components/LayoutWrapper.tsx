'use client';

import { Navigation } from './Navigation/Navigation';
import { Footer } from './Footer';

export const metadata: Metadata = {
  title: {
    default: 'Loaded Tea Club',
    template: '%s | Loaded Tea Club'
  },
  description: 'Discover local Loaded Tea Clubs, earn rewards, and connect with wellness community',
};

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}
