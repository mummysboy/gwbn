'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  CogIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
];

const adminNavigation = [
  { name: 'Publish', href: '/publish', icon: PencilSquareIcon },
  { name: 'Admin', href: '/admin', icon: CogIcon },
];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Determine if we're on an admin page
  const isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/publish');
  const currentNavigation = isAdminPage ? [...navigation, ...adminNavigation] : navigation;

  return (
    <nav className="bg-white border-b border-gray-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link href="/" className="headline-serif text-xl font-bold text-black">
            GWBN
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {currentNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors border-b-2',
                    isActive
                      ? 'text-black border-black'
                      : 'text-gray-600 border-transparent hover:text-black hover:border-gray-300'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-gray-100"
          >
            {isOpen ? (
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            ) : (
              <Bars3Icon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-300">
            <div className="py-4 space-y-2">
              {currentNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-black bg-gray-50'
                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
