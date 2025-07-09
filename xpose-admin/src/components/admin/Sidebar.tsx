'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const menuItems = [
  { name: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
  { name: 'Add Crime', icon: '🚨', path: '/admin/add-crime' },
  { name: 'Reports', icon: '📝', path: '/admin/reports' },
  { name: 'Analytics', icon: '📈', path: '/admin/analytics' },
  { name: 'Users', icon: '👥', path: '/admin/users' },
  { name: 'Settings', icon: '⚙️', path: '/admin/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsOpen(window.innerWidth >= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-50 rounded-lg bg-gray-800 p-2 shadow-lg transition-all duration-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 light:bg-blue-600 light:text-white light:hover:bg-blue-700"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      )}

      <motion.div
        initial={{ x: isMobile ? -300 : 0 }}
        animate={{
          x: isOpen ? 0 : (isMobile ? -300 : 0),
          width: isOpen ? (isMobile ? '80%' : '260px') : '80px'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed inset-y-0 z-40 border-r border-gray-700 bg-gray-900 bg-opacity-90 backdrop-blur-lg transition-colors duration-300 dark:border-gray-700 dark:bg-gray-900 dark:bg-opacity-90 light:border-gray-200 light:bg-white light:bg-opacity-90 ${isOpen ? 'shadow-2xl' : ''}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-800 p-5 light:border-gray-200">
            <div className="relative h-24 w-24">
              <Image
                src="/logo/xpose-logo-round.png"
                alt="Xpose Logo"
                width={96}
                height={96}
                className="rounded-full border-4 border-blue-600 shadow-lg"
              />
            </div>

            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-lg font-bold text-transparent light:from-blue-600 light:to-purple-700"
              >
                Xpose Admin
              </motion.div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              {menuItems.map((item, index) => (
                <Link key={item.path} href={item.path}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center space-x-3 rounded-xl p-3 transition-all duration-300 ${
                      pathname === item.path
                        ? 'border border-blue-700 bg-gradient-to-r from-blue-900 to-purple-900 shadow-lg light:border-blue-400 light:from-blue-100 light:to-purple-100 light:text-blue-800'
                        : 'border border-transparent hover:border-gray-700 hover:bg-gray-800 light:hover:border-gray-200 light:hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-medium text-gray-100 light:text-gray-700"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-gray-800 p-4 light:border-gray-200">
            <div className="flex items-center space-x-3 rounded-xl p-3 transition-colors duration-300 hover:bg-gray-800 light:hover:bg-gray-100">
              <div className="rounded-full bg-gray-700 p-2 light:bg-gray-200">
                <span className="text-xl light:text-gray-600">👤</span>
              </div>
              {isOpen && (
                <div>
                  <div className="font-medium text-gray-100 light:text-gray-800">Admin User</div>
                  <div className="text-sm text-gray-400 light:text-gray-500">admin@xpose.com</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}