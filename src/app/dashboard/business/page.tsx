'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, Eye, Star } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function BusinessDashboard() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.h1 
          variants={fadeInUp}
          className="text-2xl font-bold text-gray-900"
        >
          Business Dashboard
        </motion.h1>
        <motion.button
          variants={fadeInUp}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          View Public Profile
        </motion.button>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Profile Views */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profile Views</p>
              <p className="text-2xl font-semibold text-gray-900">1,234</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Eye className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">12%</span>
            <span className="text-gray-600 ml-2">vs last month</span>
          </div>
        </div>

        {/* Customer Visits */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customer Visits</p>
              <p className="text-2xl font-semibold text-gray-900">856</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">8%</span>
            <span className="text-gray-600 ml-2">vs last month</span>
          </div>
        </div>

        {/* Review Score */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Review Score</p>
              <p className="text-2xl font-semibold text-gray-900">4.8</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">Based on 123 reviews</span>
          </div>
        </div>

        {/* Premium Status */}
        <div className="bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 p-6 rounded-xl shadow-sm text-white">
          <p className="text-sm font-medium">Premium Status</p>
          <p className="text-2xl font-semibold mt-1">Active</p>
          <p className="mt-4 text-sm opacity-90">All premium features enabled</p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Update Menu', color: 'bg-blue-50 text-blue-600' },
            { name: 'Post Update', color: 'bg-green-50 text-green-600' },
            { name: 'View Reviews', color: 'bg-yellow-50 text-yellow-600' },
            { name: 'Edit Hours', color: 'bg-purple-50 text-purple-600' },
          ].map((action) => (
            <button
              key={action.name}
              className={`${action.color} p-4 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity`}
            >
              {action.name}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
