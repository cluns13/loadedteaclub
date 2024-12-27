'use client';

import { 
  ChartBarIcon, 
  UsersIcon, 
  StarIcon,
  HeartIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface InsightMetric {
  label: string;
  value: number;
  change: number;
  icon: any;
}

interface BusinessInsightsProps {
  businessId: string;
}

export default function BusinessInsights({ businessId }: BusinessInsightsProps) {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  
  // Mock data - replace with real API calls
  const metrics: InsightMetric[] = [
    {
      label: 'Profile Views',
      value: 2547,
      change: 12.5,
      icon: UsersIcon
    },
    {
      label: 'Menu Interactions',
      value: 487,
      change: -2.3,
      icon: ChartBarIcon
    },
    {
      label: 'Favorites',
      value: 156,
      change: 8.7,
      icon: HeartIcon
    },
    {
      label: 'Rating',
      value: 4.8,
      change: 0.2,
      icon: StarIcon
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Business Insights</h2>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  timeframe === period
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="p-4 rounded-lg border border-gray-100 hover:border-purple-200 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{metric.label}</p>
                <p className="text-2xl font-semibold mt-1">
                  {metric.label === 'Rating' ? metric.value.toFixed(1) : metric.value.toLocaleString()}
                </p>
              </div>
              <metric.icon className="h-5 w-5 text-purple-500" />
            </div>
            
            <div className="mt-2 flex items-center">
              {metric.change > 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
              )}
              <span 
                className={`text-sm ml-1 ${
                  metric.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {Math.abs(metric.change)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last {timeframe}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="px-4 py-2 text-sm text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            Update Menu
          </button>
          <button className="px-4 py-2 text-sm text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            Post Update
          </button>
          <button className="px-4 py-2 text-sm text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            View Reviews
          </button>
          <button className="px-4 py-2 text-sm text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            Add Promotion
          </button>
        </div>
      </div>
    </div>
  );
}
