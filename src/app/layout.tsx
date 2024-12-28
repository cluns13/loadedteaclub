import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { setupGlobalErrorHandlers } from '@/lib/utils/globalErrorHandler'
import * as Sentry from "@sentry/nextjs";
import './globals.css';
import Providers from '@/components/providers/Providers';
import LayoutWrapper from '@/components/LayoutWrapper';

// Initialize global error handlers
if (process.env.NODE_ENV === 'production') {
  setupGlobalErrorHandlers();
}

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Loaded Tea Club',
  description: 'Discover and explore local tea clubs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Sentry.ErrorBoundary fallback={({ error }) => (
          <div>
            <h1>Something went wrong</h1>
            <p>{error.message}</p>
          </div>
        )}>
          <Providers>
            <LayoutWrapper>{children}</LayoutWrapper>
          </Providers>
        </Sentry.ErrorBoundary>
      </body>
    </html>
  )
}
