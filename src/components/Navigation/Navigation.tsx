'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, User, LogOut, Store, ChevronDown } from 'lucide-react';
import { LoadingButton } from '../ui/LoadingButton';
import { useState } from 'react';
import { Session } from 'next-auth';

type NavigationItem = {
  name: string;
  href: string;
};

const navigation: NavigationItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Order', href: '/order' },
  { name: 'Rewards', href: '/rewards' },
  { name: 'Learn', href: '/learn' },
  { name: 'About', href: '/about' },
];

const userNavigation: Record<string, NavigationItem[]> = {
  user: [
    { name: 'My Saved Places', href: '/dashboard/saved' },
    { name: 'My Reviews', href: '/dashboard/reviews' },
    { name: 'Account Settings', href: '/dashboard/settings' },
  ],
  business: [
    { name: 'Business Dashboard', href: '/dashboard/business' },
    { name: 'Manage Locations', href: '/dashboard/business/locations' },
    { name: 'Reviews & Responses', href: '/dashboard/business/reviews' },
    { name: 'Business Settings', href: '/dashboard/business/settings' },
  ],
  admin: [
    { name: 'Admin Dashboard', href: '/admin' },
    { name: 'Manage Users', href: '/admin/users' },
    { name: 'Business Claims', href: '/admin/claims' },
    { name: 'Site Settings', href: '/admin/settings' },
  ]
};

export function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const getUserRole = (session: Session | null): string => {
    if (!session?.user) return 'USER';
    return session.user.role || 'USER';
  };

  const userRole = getUserRole(session);
  const isBusinessOwner = userRole === 'BUSINESS_OWNER';
  const isAdmin = session?.user?.isAdmin || false;

  const getCurrentNavigation = (): NavigationItem[] => {
    if (isAdmin) return userNavigation.admin;
    if (isBusinessOwner) return userNavigation.business;
    return userNavigation.user;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[hsl(var(--border))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-xl font-bold text-[hsl(var(--primary))]"
            >
              TeaFinder
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:ml-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href 
                      ? 'text-[hsl(var(--primary))]' 
                      : 'text-gray-600 hover:text-[hsl(var(--primary))]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Auth Section */}
            {status === 'loading' ? (
              <LoadingButton 
                className="w-8 h-8"
                children={undefined}  
              />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center">
                    {session.user?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                  </div>
                  <span>{session.user?.name || 'User'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {getCurrentNavigation().map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-[hsl(var(--primary))]"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-[hsl(var(--primary))] text-white hover:opacity-90 transition-colors"
                >
                  Sign up
                </Link>
                {/* List Your Business Button (only show if not a business owner) */}
                {!isBusinessOwner && !isAdmin && (
                  <Link
                    href="/register?role=business"
                    className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium border border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-colors"
                  >
                    <Store className="w-4 h-4 mr-2" />
                    List Your Business
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === item.href
                      ? 'text-[hsl(var(--primary))]'
                      : 'text-gray-600 hover:text-[hsl(var(--primary))]'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {session ? (
                <>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="px-3 py-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center">
                          {session.user?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                        </div>
                        <div className="ml-3">
                          <div className="text-base font-medium text-gray-800">
                            {session.user?.name || 'User'}
                          </div>
                          <div className="text-sm font-medium text-gray-500">
                            {session.user?.email || 'No email'}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1">
                        {getCurrentNavigation().map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-[hsl(var(--primary))]"
                            onClick={() => setIsOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ))}

                        <button
                          onClick={handleSignOut}
                          className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-[hsl(var(--primary))]"
                        >
                          <LogOut className="w-4 h-4 mr-2 inline-block" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <Link
                    href="/login"
                    className="block w-full text-center px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-[hsl(var(--primary))]"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full text-center px-4 py-2 rounded-md text-sm font-medium bg-[hsl(var(--primary))] text-white hover:opacity-90 transition-colors"
                  >
                    Sign up
                  </Link>
                  {/* List Your Business Button (only show if not a business owner) */}
                  {!isBusinessOwner && !isAdmin && (
                    <Link
                      href="/register?role=business"
                      className="block w-full text-center inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium border border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-colors"
                    >
                      <Store className="w-4 h-4 mr-2" />
                      List Your Business
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
