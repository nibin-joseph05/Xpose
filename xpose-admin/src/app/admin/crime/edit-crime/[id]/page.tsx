'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/admin/ui/button';

interface CrimeType {
  id: number;
  name: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresImmediateAttention: boolean;
  categoryId: number;
  categoryName?: string;
}

interface CrimeCategory {
  id: number;
  name: string;
  description: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditCrimeTypePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [crimeType, setCrimeType] = useState<CrimeType | null>(null);
  const [categories, setCategories] = useState<CrimeCategory[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH',
    requiresImmediateAttention: false,
    categoryId: 0,
  });
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
      const crimeResponse = await fetch(`${API_URL}/api/crimes/dto`);
      if (!crimeResponse.ok) throw new Error('Failed to fetch crime type');
      const crimeData = await crimeResponse.json();
      const targetCrime = crimeData.find((crime: CrimeType) => crime.id === Number(id));
      if (!targetCrime) throw new Error('Crime type not found');
      setCrimeType(targetCrime);
      setFormData({
        name: targetCrime.name,
        description: targetCrime.description || '',
        priority: targetCrime.priority,
        requiresImmediateAttention: targetCrime.requiresImmediateAttention,
        categoryId: targetCrime.categoryId || 0,
      });

      const categoriesResponse = await fetch(`${API_URL}/api/crime-categories`);
      if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
      const categoriesData = await categoriesResponse.json();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/crimes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          priority: formData.priority,
          requiresImmediateAttention: formData.requiresImmediateAttention,
          category: { id: formData.categoryId },
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update crime type');
      }
      alert('Crime type updated successfully!');
      router.push('/admin/crime');
    } catch (err: any) {
      console.error('Error updating crime type:', err);
      setError(err.message || 'Error updating crime type');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: name === 'categoryId' ? Number(value) : value });
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-7xl"
        >
          <AdminHeader title="Edit Crime Type" />

          <div className="my-8"></div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900 text-red-200 p-4 rounded-lg border border-red-700 mb-6 font-medium light:bg-red-100 light:text-red-700 light:border-red-300"
            >
              {error}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl dark:hover:border-blue-600 transition-all duration-300 light:border-gray-300 light:bg-white light:bg-opacity-80 light:hover:border-blue-500"
          >
            <div className="p-6">
              {loading ? (
                <div className="text-center text-gray-400 light:text-gray-600">Loading crime type...</div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 light:text-gray-700">
                      Crime Type Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
                      placeholder="Enter crime type name"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 light:text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
                      placeholder="Enter crime type description"
                    />
                  </div>
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-300 light:text-gray-700">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 light:bg-gray-100 light:border-gray-300 light:text-gray-900"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-300 light:text-gray-700">
                      <input
                        type="checkbox"
                        name="requiresImmediateAttention"
                        checked={formData.requiresImmediateAttention}
                        onChange={handleChange}
                        className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 rounded light:border-gray-300"
                      />
                      Requires Immediate Attention
                    </label>
                  </div>
                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300 light:text-gray-700">
                      Category
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 light:bg-gray-100 light:border-gray-300 light:text-gray-900"
                    >
                      <option value={0}>Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      onClick={() => router.push('/admin/crime')}
                      className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300 ease-out disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}