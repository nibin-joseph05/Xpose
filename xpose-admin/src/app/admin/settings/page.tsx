
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/admin/ui/button';

interface SettingsService {
  id: number;
  title: string;
  description: string;
  icon: string;
  link: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const settingsServices: SettingsService[] = [
    {
      id: 1,
      title: 'Profile Settings',
      description: 'Update your personal information, including username, email, and name.',
      icon: '👤',
      link: '/admin/settings/profile',
    },
    {
      id: 2,
      title: 'Notification Preferences',
      description: 'Manage how you receive alerts and updates.',
      icon: '🔔',
      link: '/admin/settings/notifications',
    },
    {
      id: 3,
      title: 'Security Settings',
      description: 'Configure two-factor authentication and password settings.',
      icon: '🔒',
      link: '/admin/settings/security',
    },
    {
      id: 4,
      title: 'Theme Preferences',
      description: 'Switch between light and dark mode for the dashboard.',
      icon: '🌗',
      link: '/admin/settings/theme',
    },
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme === 'light' ? 'light' : 'dark');
    } else {
      setTheme('dark');
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/admin/login');
    } else {
      
      setTimeout(() => setLoading(false), 1500);
    }
  }, [router]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-indigo-950 text-white transition-colors duration-500 dark:from-gray-950 dark:to-indigo-950 light:from-blue-50 light:to-purple-50 light:text-gray-900">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-20">
        <div className="particle-layer"></div>
        <div className="shimmer-layer"></div>
      </div>

      <Sidebar />

      <main className="ml-0 p-4 transition-all duration-300 md:ml-[80px] md:p-8 lg:ml-[260px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-7xl"
        >
          <AdminHeader title="Settings" />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl dark:hover:border-blue-600 transition-all duration-300 light:border-gray-300 light:bg-white light:bg-opacity-80 light:hover:border-blue-500"
          >
            <div className="border-b border-gray-700 p-6 light:border-gray-300">
              <h3 className="text-xl font-bold text-blue-300 light:text-blue-700">Settings Services</h3>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900 text-red-200 p-4 rounded-lg border border-red-700 m-6 font-medium light:bg-red-100 light:text-red-700 light:border-red-300"
              >
                {error}
              </motion.div>
            )}

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                  <div className="h-32 w-full animate-pulse rounded bg-gray-700 light:bg-gray-200 col-span-2"></div>
                ) : (
                  settingsServices.map((service) => (
                    <motion.div
                      key={service.id}
                      whileHover={{ y: -5 }}
                      className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-6 shadow-lg transition-all duration-300 ease-in-out dark:bg-gray-800 dark:bg-opacity-60 light:border-gray-200 light:bg-white light:bg-opacity-80"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{service.icon}</span>
                            <h4 className="text-lg font-bold text-gray-100 light:text-gray-800">{service.title}</h4>
                          </div>
                          <p className="mt-2 text-sm text-gray-400 light:text-gray-600">{service.description}</p>
                        </div>
                        <Button
                          onClick={() => router.push(service.link)}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300 ease-out"
                        >
                          Manage
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl dark:hover:border-purple-600 transition-all duration-300 light:border-gray-300 light:bg-white light:bg-opacity-80 light:hover:border-purple-500"
          >
            <div className="border-b border-gray-700 p-6 light:border-gray-300">
              <h3 className="text-xl font-bold text-blue-300 light:text-blue-700">Preferences</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300 light:text-gray-700">
                  Theme
                </label>
                <Button
                  onClick={toggleTheme}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300 ease-out"
                >
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <style jsx>{`
        .particle-layer,
        .shimmer-layer {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .particle-layer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 40%);
          animation: background-move 15s infinite alternate ease-in-out;
        }

        .shimmer-layer::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.05) 5%,
            rgba(255, 255, 255, 0.1) 10%,
            transparent 15%
          );
          transform: rotate(45deg);
          animation: shimmer-background 8s infinite linear;
        }

        @keyframes background-move {
          0% {
            transform: translate(0, 0);
            opacity: 0.2;
          }
          50% {
            transform: translate(5%, 5%);
            opacity: 0.3;
          }
          100% {
            transform: translate(0, 0);
            opacity: 0.2;
          }
        }

        @keyframes shimmer-background {
          0% {
            transform: translateX(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) rotate(45deg);
          }
        }
      `}</style>
    </div>
  );
}
