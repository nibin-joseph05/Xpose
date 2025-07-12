'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/admin/ui/button';

interface CrimeType {
  id: number;
  name: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresImmediateAttention: boolean;
  category: {
    name: string;
  };
}

interface CrimeCategory {
  id: number;
  name: string;
  description: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CrimePage() {
  const router = useRouter();
  const [crimeTypes, setCrimeTypes] = useState<CrimeType[]>([]);
  const [categories, setCategories] = useState<CrimeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme === 'light' ? 'light' : 'dark');
    } else {
      setTheme('dark');
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const crimesResponse = await fetch(`${API_URL}/api/crimes`);
      const crimesData = await crimesResponse.json();
      setCrimeTypes(Array.isArray(crimesData) ? crimesData : []);

      const categoriesResponse = await fetch(`${API_URL}/api/crime-categories`);
      const categoriesData = await categoriesResponse.json();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <span className="bg-red-900 bg-opacity-50 px-2 py-1 rounded text-red-300">High</span>;
      case 'MEDIUM':
        return <span className="bg-yellow-900 bg-opacity-50 px-2 py-1 rounded text-yellow-300">Medium</span>;
      default:
        return <span className="bg-green-900 bg-opacity-50 px-2 py-1 rounded text-green-300">Low</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-indigo-950 text-white transition-colors duration-500 dark:from-gray-950 dark:to-indigo-950 light:from-blue-50 light:to-purple-50 light:text-gray-900">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-20">
        <div className="particle-layer pointer-events-none"></div>
        <div className="shimmer-layer pointer-events-none"></div>
      </div>

      <Sidebar />

      <main className="ml-0 p-4 transition-all duration-300 md:ml-[80px] md:p-8 lg:ml-[260px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-7xl"
        >
          <AdminHeader title="Crime Management" />

          <div className="pt-8 flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-blue-400 light:text-blue-700">Crime Types & Categories</h2>
            <div className="flex space-x-4">
              <Button
                onClick={() => router.push('/admin/crime/add-category')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Category
              </Button>
              <Button
                onClick={() => router.push('/admin/crime/add-crime')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Add Crime Type
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl
            light:border-gray-300 light:bg-white light:bg-opacity-80"
          >
            <div className="border-b border-gray-700 p-6 light:border-gray-300">
              <h3 className="text-xl font-bold text-blue-300 light:text-blue-700">Crime Types</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 text-left text-gray-400 light:border-gray-300 light:text-gray-600">
                    <th className="p-4">Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Urgent</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center">
                        Loading crime types...
                      </td>
                    </tr>
                  ) : crimeTypes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-400">
                        No crime types found
                      </td>
                    </tr>
                  ) : (
                    crimeTypes.map((crime) => (
                      <tr key={crime.id} className="border-b border-gray-800 hover:bg-gray-700 hover:bg-opacity-30 light:border-gray-200 light:hover:bg-gray-100">
                        <td className="p-4 font-medium light:text-gray-800">{crime.name}</td>
                        <td className="p-4 light:text-gray-700">{crime.category?.name || 'Uncategorized'}</td>
                        <td className="p-4">{getPriorityBadge(crime.priority)}</td>
                        <td className="p-4">
                          {crime.requiresImmediateAttention ? (
                            <span className="text-red-400">⚠️ Immediate</span>
                          ) : (
                            <span className="text-gray-400 light:text-gray-500">Normal</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl
            light:border-gray-300 light:bg-white light:bg-opacity-80"
          >
            <div className="border-b border-gray-700 p-6 light:border-gray-300">
              <h3 className="text-xl font-bold text-blue-300 light:text-blue-700">Crime Categories</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 text-left text-gray-400 light:border-gray-300 light:text-gray-600">
                    <th className="p-4">Name</th>
                    <th className="p-4">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="p-4 text-center">
                        Loading categories...
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="p-4 text-center text-gray-400">
                        No categories found
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr key={category.id} className="border-b border-gray-800 hover:bg-gray-700 hover:bg-opacity-30 light:border-gray-200 light:hover:bg-gray-100">
                        <td className="p-4 font-medium light:text-gray-800">{category.name}</td>
                        <td className="p-4 text-gray-400 light:text-gray-700">{category.description || 'No description'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}