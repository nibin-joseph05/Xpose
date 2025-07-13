'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/admin/ui/button';

interface CrimeCategory {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AddCategoryPage() {
  const router = useRouter();
  const [categoryData, setCategoryData] = useState<CrimeCategory>({
    name: '',
    description: '',
    createdAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<CrimeCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme === 'light' ? 'light' : 'dark');
    } else {
      setTheme('dark');
    }
    fetchCategories();
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

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError('');
    try {
      const response = await fetch(`${API_URL}/api/crime-categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setCategoriesError(err.message || 'Failed to fetch categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { createdAt, ...dataToSend } = categoryData;
      const response = await fetch(`${API_URL}/api/crime-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add category');
      }

      setSuccess('Crime category added successfully!');
      setCategoryData({ name: '', description: '', createdAt: ''});
      fetchCategories();
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-indigo-950 text-white transition-colors duration-500 dark:from-gray-950 dark:to-indigo-950 light:from-blue-50 light:to-purple-50 light:text-gray-900">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-20">
        <div className="particle-layer"></div>
        <div className="shimmer-layer"></div>
      </div>

      <Sidebar />

      <main className="ml-0 p-4 transition-all duration-300 md:ml-[80px] md:p-8 lg:ml-[260px]">
        <AdminHeader
          title="Manage Crime Categories"
          backUrl="/admin/crime"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto pt-8 grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-2xl
            dark:hover:border-blue-500 transition-all duration-300
            light:border-gray-300 light:bg-white light:bg-opacity-80 light:hover:border-blue-500"
          >
            <div className="border-b border-gray-700 p-6 flex justify-between items-center light:border-gray-300">
              <h3 className="text-xl font-bold text-blue-300 light:text-blue-700">Add New Category</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div>
                <label htmlFor="categoryName" className="block text-gray-300 mb-2 font-medium light:text-gray-700">Category Name</label>
                <input
                  id="categoryName"
                  type="text"
                  value={categoryData.name}
                  onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200
                  light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
                  placeholder="e.g., Violent Crimes, Theft, Cybercrime"
                  required
                />
              </div>

              <div>
                <label htmlFor="categoryDescription" className="block text-gray-300 mb-2 font-medium light:text-gray-700">Description</label>
                <textarea
                  id="categoryDescription"
                  value={categoryData.description}
                  onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-y
                  min-h-[100px] bg-gray-700 text-white
                  light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
                  rows={4}
                  placeholder="Briefly describe this crime category, its scope, and common types of incidents."
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold text-lg tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                  light:bg-blue-700 light:hover:bg-blue-800 light:text-white"
                >
                  {loading ? 'Adding Category...' : 'Add Category'}
                </Button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900 text-red-200 p-4 rounded-lg border border-red-700 mt-4 font-medium light:bg-red-100 light:text-red-700 light:border-red-300"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-900 text-green-200 p-4 rounded-lg border border-green-700 mt-4 font-medium light:bg-green-100 light:text-green-700 light:border-green-300"
                >
                  {success}
                </motion.div>
              )}
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-2xl
            dark:hover:border-purple-500 transition-all duration-300
            light:border-gray-300 light:bg-white light:bg-opacity-80 light:hover:border-purple-500"
          >
            <div className="border-b border-gray-700 p-6 flex justify-between items-center light:border-gray-300">
              <h3 className="text-xl font-bold text-purple-300 light:text-purple-700">Existing Categories</h3>
              <Button
                onClick={fetchCategories}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-4 py-2 rounded-md text-sm transition-all duration-200
                light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700 light:hover:text-gray-900"
                title="Refresh Categories"
              >
                Refresh
              </Button>
            </div>

            <div className="overflow-y-auto max-h-[400px]">
              <table className="w-full">
                <thead>
                  <tr className="sticky top-0 bg-gray-800 bg-opacity-70 backdrop-blur-sm border-b border-gray-700 text-left text-gray-400 light:bg-white light:bg-opacity-80 light:border-gray-300 light:text-gray-600 z-10">
                    <th className="p-4">Name</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriesLoading ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-400 light:text-gray-600">
                        Loading categories...
                      </td>
                    </tr>
                  ) : categoriesError ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-red-400 light:text-red-600">
                        {categoriesError}
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-400 light:text-gray-600">
                        No categories found. Add one above!
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <motion.tr
                        key={category.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-gray-800 hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200
                        light:border-gray-200 light:hover:bg-gray-100"
                      >
                        <td className="p-4 font-medium text-blue-200 light:text-blue-700">{category.name}</td>
                        <td className="p-4 text-gray-400">{category.description || 'No description provided.'}</td>
                        <td className="p-4 text-gray-400 text-sm light:text-gray-600">
                          {formatTimestamp(category.createdAt)}
                        </td>
                      </motion.tr>
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