'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Clock, MapPin, Phone, Mail, Globe, Plus } from 'lucide-react';

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

export default function ListingManagement() {
  const [activeTab, setActiveTab] = useState('basic');

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
          Manage Your Listing
        </motion.h1>
        <motion.button
          variants={fadeInUp}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Preview Changes
        </motion.button>
      </div>

      {/* Tabs */}
      <motion.div variants={fadeInUp} className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['basic', 'photos', 'menu', 'hours', 'amenities'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Content */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl shadow-sm border border-gray-100">
        {activeTab === 'basic' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Your business name"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="(555) 555-5555"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Business address"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Tell customers about your business..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Upload Box */}
              <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-green-500 cursor-pointer transition-colors">
                <Camera className="h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Add Photos</p>
              </div>

              {/* Sample Photos */}
              {[1, 2, 3].map((photo) => (
                <div key={photo} className="aspect-square bg-gray-100 rounded-lg relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500">Photo {photo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="p-6">
            <div className="space-y-4">
              {/* Menu Categories */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Menu Categories</h3>
                <button className="flex items-center text-green-600 hover:text-green-700">
                  <Plus className="h-5 w-5 mr-1" />
                  Add Category
                </button>
              </div>

              {/* Sample Category */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Popular Drinks</h4>
                  <button className="text-green-600 hover:text-green-700 text-sm">
                    Add Item
                  </button>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  {['Mega Tea', 'Energy Bomb', 'Healthy Shake'].map((item) => (
                    <div key={item} className="bg-white p-3 rounded-md shadow-sm">
                      <div className="flex items-center justify-between">
                        <span>{item}</span>
                        <button className="text-gray-400 hover:text-gray-500">
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="p-6">
            <div className="space-y-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <div key={day} className="flex items-center space-x-4">
                  <span className="w-28 text-gray-700">{day}</span>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg">
                    <option>9:00 AM</option>
                    {/* Add more options */}
                  </select>
                  <span>to</span>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg">
                    <option>5:00 PM</option>
                    {/* Add more options */}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
