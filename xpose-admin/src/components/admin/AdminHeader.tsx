'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminHeader() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme === 'light' ? 'light' : 'dark');
      document.documentElement.classList.add(savedTheme);
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/admin/login');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex items-center justify-between rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-4 shadow-xl backdrop-blur-md transition-colors duration-300
      light:border-blue-200 light:bg-white light:bg-opacity-80 light:shadow-lg"
    >
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-3xl font-bold text-transparent md:text-4xl
        light:from-blue-600 light:to-purple-700"
      >
        Admin Dashboard
      </motion.h1>

      <div className="relative ml-8 flex-1 max-w-sm">
        <input
          type="text"
          placeholder="Search reports, users, or settings..."
          className="w-full rounded-full border border-gray-700 bg-gray-900 bg-opacity-70 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
          light:border-gray-300 light:bg-gray-100 light:text-gray-800 light:placeholder-gray-500 light:focus:ring-blue-500"
        />
        <span className="absolute left-3 top-2.5 text-gray-400 light:text-gray-500">🔍</span>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="rounded-full bg-gray-700 p-2 text-white shadow-md transition-colors duration-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500
          light:bg-blue-600 light:hover:bg-blue-700 light:focus:ring-blue-400 light:text-white"
        >
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          className="rounded-full bg-red-600 p-2 text-white shadow-md transition-colors duration-300 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500
          light:bg-red-500 light:hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </motion.div>
  );
}