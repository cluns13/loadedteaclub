'use client';

import { useState } from 'react';
import { testRoutes } from '@/tests/test-routes';
import { LiquidBackground } from '@/components/LiquidBackground';

export default function TestPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: any) => {
    setResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Auth tests
      addResult({ type: 'auth', data: await testRoutes.testAuth() });

      // Search tests
      addResult({ type: 'search', data: await testRoutes.testSearch('Jacksonville') });

      // Location tests
      addResult({ type: 'location', data: await testRoutes.testSaveLocation('test-location') });

      // Business tests
      addResult({ type: 'business', data: await testRoutes.testBusinessClaim('test-business') });
    } catch (error) {
      addResult({ type: 'error', data: error });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[100svh] relative overflow-hidden">
      <LiquidBackground />

      <main className="relative min-h-[100svh] pt-8 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Test Dashboard
            </h1>
            <p className="mt-3 text-lg text-white/80">
              Test all routes and functionality
            </p>
          </div>

          <div className="relative transform hover:scale-[1.01] transition-transform duration-500">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-xl rounded-3xl" />
            <div className="relative p-8 rounded-3xl">
              <div className="flex justify-center mb-8">
                <button
                  onClick={runTests}
                  disabled={loading}
                  className="px-6 py-3 bg-[#24C6DC] text-white rounded-xl hover:bg-[#20b3c7] 
                           transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Running Tests...' : 'Run All Tests'}
                </button>
              </div>

              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/10 backdrop-blur-sm rounded-xl text-white"
                  >
                    <h3 className="font-medium mb-2">
                      Test: {result.type.toUpperCase()}
                    </h3>
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
