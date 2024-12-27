'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const footerLinks = {
  discover: [
    { name: 'Find Loaded Teas', href: '/' },
    { name: 'Learn About Teas', href: '/learn' },
    { name: 'About Us', href: '/about' },
    { name: 'Latest Locations', href: '/' },
  ],
  business: [
    { name: 'List Your Business', href: '/register?role=business' },
    { name: 'Business Dashboard', href: '/dashboard/business' },
    { name: 'Add Your Location', href: '/dashboard/business/add' },
    { name: 'Marketing Tools', href: '/dashboard/business/marketing' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Accessibility', href: '/accessibility' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Report an Issue', href: '/report' },
    { name: 'Feedback', href: '/feedback' },
  ],
};

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/loadedteafinder' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/loadedteafinder' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/loadedteafinder' },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-[hsl(var(--border))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link 
              href="/" 
              className="text-2xl font-bold text-[hsl(var(--primary))] mb-4 block"
            >
              TeaFinder
            </Link>
            <p className="text-gray-500 mb-6">
              Discover and enjoy loaded teas near you. The ultimate directory for loaded tea enthusiasts and business owners.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[hsl(var(--primary))] transition-colors"
                >
                  <link.icon className="h-5 w-5" />
                  <span className="sr-only">{link.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Discover</h3>
            <ul className="space-y-3">
              {footerLinks.discover.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-[hsl(var(--primary))] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">For Business</h3>
            <ul className="space-y-3">
              {footerLinks.business.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-[hsl(var(--primary))] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-[hsl(var(--primary))] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[hsl(var(--border))]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} TeaFinder. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 md:justify-end">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-gray-500 hover:text-[hsl(var(--primary))] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
