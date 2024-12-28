'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const navItems = [
  { name: 'Overview', href: '/dashboard/business', icon: Menu },
  { name: 'Listing', href: '/dashboard/business/listing', icon: Menu },
  { name: 'Analytics', href: '/dashboard/business/analytics', icon: Menu },
  { name: 'Reviews', href: '/dashboard/business/reviews', icon: Menu },
  { name: 'Marketing', href: '/dashboard/business/marketing', icon: Menu },
  { name: 'Promotions', href: '/dashboard/business/promotions', icon: Menu },
  { name: 'Insights', href: '/dashboard/business/insights', icon: Menu },
  { name: 'Settings', href: '/dashboard/business/settings', icon: Menu },
];

export default function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 pt-16 ${
            isCollapsed ? 'w-16' : 'w-64'
          } transition-all duration-300`}
        >
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } transition-colors duration-150`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-green-500' : 'text-gray-400'}`} />
                  {!isCollapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main
          className={`flex-1 ${
            isCollapsed ? 'ml-16' : 'ml-64'
          } pt-16 transition-all duration-300`}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
