'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const menuItems = [
  { name: 'Dashboard', icon: '📊', path: '/police/dashboard' },
  { name: 'Reports', icon: '📝', path: '/police/reports' },
  { name: 'Station Details', icon: '🏢', path: '/police/station' },
  { name: 'Settings', icon: '⚙️', path: '/police/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState({ name: 'Police Officer', email: 'officer@xpose.com' });
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.220.2:8080';

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsOpen(window.innerWidth >= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/authority/current`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser({
            name: userData.name,
            email: userData.email
          });
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-50 rounded-lg bg-gray-800 p-2 shadow-lg transition-all duration-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C3B091] light:bg-[#C3B091] light:text-white light:hover:bg-[#8B7B5A]"
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
        className={`fixed inset-y-0 z-40 border-r border-gray-700 bg-gray-900 bg-opacity-90 backdrop-blur-lg transition-colors duration-300 dark:border-gray-700 dark:bg-gray-900 dark:bg-opacity-90 light:border-[#C3B091] light:bg-white light:bg-opacity-90 ${isOpen ? 'shadow-2xl' : ''}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-800 p-5 light:border-[#C3B091]">
            <div className="relative h-24 w-24">
              <Image
                src="/logo/xpose-logo-round.png"
                alt="Xpose Logo"
                width={96}
                height={96}
                className="rounded-full border-4 border-[#C3B091] shadow-lg"
              />
            </div>

            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-r from-[#C3B091] to-[#8B7B5A] bg-clip-text text-lg font-bold text-transparent light:from-[#C3B091] light:to-[#8B7B5A]"
              >
                Xpose Police
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
                        ? 'border border-[#C3B091] bg-gradient-to-r from-[#C3B091] to-[#8B7B5A] shadow-lg light:border-[#8B7B5A] light:from-[#E6D4A8] light:to-[#A69875] light:text-gray-800'
                        : 'border border-transparent hover:border-gray-700 hover:bg-gray-800 light:hover:border-[#C3B091] light:hover:bg-gray-100'
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

          <div className="border-t border-gray-800 p-4 light:border-[#C3B091]">
            <div className="flex items-center space-x-3 rounded-xl p-3 transition-colors duration-300 hover:bg-gray-800 light:hover:bg-gray-100">
              <div className="rounded-full bg-gray-700 p-2 light:bg-[#C3B091]">
                <span className="text-xl light:text-gray-800">👤</span>
              </div>
              {isOpen && (
                <div>
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-700 light:bg-gray-200"></div>
                      <div className="h-3 w-24 animate-pulse rounded bg-gray-600 light:bg-gray-300"></div>
                    </div>
                  ) : (
                    <>
                      <div className="font-medium text-gray-100 light:text-gray-800">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {user.email}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}