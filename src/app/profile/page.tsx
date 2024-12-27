'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { User, MapPin, Calendar, Star, Heart, Clock } from 'lucide-react';

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

export default function Profile() {
  const { data: session } = useSession();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Profile Header */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <User className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {session?.user?.name || 'User Profile'}
            </h1>
            <p className="text-gray-500">
              {session?.user?.email}
            </p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              <span>Location (Not Set)</span>
            </div>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Member since December 2023</span>
            </div>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Edit Profile
          </button>
        </div>
      </motion.div>

      {/* Activity Section */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Reviews */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Reviews</h2>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-gray-500">No reviews yet</p>
          <button className="mt-4 w-full px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            Write a Review
          </button>
        </div>

        {/* Favorite Spots */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Favorite Spots</h2>
            <Heart className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-gray-500">No favorites yet</p>
          <button className="mt-4 w-full px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            Find Tea Spots
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-gray-500">No recent activity</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
