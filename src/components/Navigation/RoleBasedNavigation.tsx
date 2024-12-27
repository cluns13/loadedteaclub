import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  BookOpen,
  User,
  Store,
  BarChart,
  Settings,
  Shield,
  Menu,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { LoadingButton } from '../ui/LoadingButton';

// Navigation items for each user role
const customerNav = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Learn', href: '/learn', icon: BookOpen },
];

const businessNav = [
  { name: 'Dashboard', href: '/dashboard/business', icon: Store },
  { name: 'Analytics', href: '/dashboard/business/analytics', icon: BarChart },
  { name: 'Menu', href: '/dashboard/business/menu', icon: Menu },
  { name: 'Reviews', href: '/dashboard/business/reviews', icon: MessageSquare },
  { name: 'Settings', href: '/dashboard/business/settings', icon: Settings },
];

const adminNav = [
  { name: 'Overview', href: '/admin', icon: Shield },
  { name: 'Claims', href: '/admin/claims', icon: Store },
  { name: 'Users', href: '/admin/users', icon: User },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function RoleBasedNavigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Determine user role
  const role = session?.user?.role;
  const isAdmin = role === 'ADMIN';
  const isBusinessOwner = role === 'BUSINESS_OWNER';

  // Select navigation items based on role
  const navItems = isAdmin ? adminNav : isBusinessOwner ? businessNav : customerNav;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            TeaFinder
            {isAdmin && <span className="ml-2 text-sm text-[var(--primary)]">(Admin)</span>}
            {isBusinessOwner && <span className="ml-2 text-sm text-[var(--primary)]">(Business)</span>}
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-link flex items-center ${
                    pathname === item.href ? 'bg-white/10' : ''
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <LoadingButton
                  variant="ghost"
                  size="sm"
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[var(--primary)] text-xs flex items-center justify-center">
                    2
                  </span>
                </LoadingButton>

                {/* Profile Menu */}
                <LoadingButton
                  as="a"
                  href="/profile"
                  variant="secondary"
                  size="sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </LoadingButton>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <LoadingButton
                  as="a"
                  href="/login"
                  variant="ghost"
                  size="sm"
                >
                  Sign In
                </LoadingButton>
                <LoadingButton
                  as="a"
                  href="/register"
                  variant="primary"
                  size="sm"
                >
                  Sign Up
                </LoadingButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
