'use client';

import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import BusinessRedemptionScanner from '@/components/rewards/BusinessRedemptionScanner';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

// Mock data - will be replaced with real API calls
const mockAnalytics = [
  { month: 'Jan', customers: 40 },
  { month: 'Feb', customers: 30 },
  { month: 'Mar', customers: 50 },
  { month: 'Apr', customers: 75 },
  { month: 'May', customers: 60 },
];

interface BusinessData {
  name: string;
  totalCustomers: number;
  monthlyVisitors: number;
  redemptionRate: number;
}

export default function BusinessDashboard() {
  const [businessData, setBusinessData] = useState<BusinessData>({
    name: 'Nutrition Club',
    totalCustomers: 0,
    monthlyVisitors: 0,
    redemptionRate: 0
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {businessData.name} Dashboard
          </h1>
          <Button 
            className="bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
          >
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Quick Stats Cards */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4">Total Customers</h3>
            <p className="text-4xl font-bold text-teal-400">
              {businessData.totalCustomers}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4">Monthly Visitors</h3>
            <p className="text-4xl font-bold text-teal-400">
              {businessData.monthlyVisitors}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4">Redemption Rate</h3>
            <p className="text-4xl font-bold text-teal-400">
              {businessData.redemptionRate}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Growth Chart */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4">Customer Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockAnalytics}>
                <XAxis dataKey="month" stroke="#24C6DC" />
                <YAxis stroke="#24C6DC" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(36, 198, 220, 0.1)', 
                    borderColor: '#24C6DC' 
                  }}
                />
                <Bar dataKey="customers" fill="#24C6DC" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Redemption Scanner */}
          <div>
            <BusinessRedemptionScanner clubId="your_club_id" />
          </div>
        </div>
      </div>
    </div>
  );
}
