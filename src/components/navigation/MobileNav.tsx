'use client';

import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export interface MobileNavProps {
  items: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
  }>;
  className?: string;
}

const MobileNav: React.FC<MobileNavProps> = ({ items, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className={cn('relative', className)}>
      {/* Mobile menu button */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle mobile menu"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={toggleMenu} />
          
          {/* Mobile menu panel */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-sm bg-white dark:bg-gray-800 shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Navigation items */}
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {items.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.href}
                        className="flex items-center gap-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={toggleMenu}
                      >
                        {item.icon && (
                          <span className="flex-shrink-0">{item.icon}</span>
                        )}
                        <span className="font-medium">{item.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Golden West Business News Mobile App
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNav;
