'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';

interface CrimeCategory {
  id: number;
  name: string;
}

interface CrimeType {
  name: string;
  description: string;
  categoryId: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresImmediateAttention: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AddCrimePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CrimeCategory[]>([]);
  const [crimeData, setCrimeData] = useState<CrimeType>({
    name: '',
    description: '',
    categoryId: 0,
    priority: 'MEDIUM',
    requiresImmediateAttention: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/crime-categories`);
      const data = await response.json();
      setCategories(data);
      if (data.length > 0) {
        setCrimeData(prev => ({ ...prev, categoryId: data[0].id }));
      }
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/crimes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...crimeData,
          category: { id: crimeData.categoryId },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add crime');
      }

      setSuccess('Crime type added successfully!');
      setTimeout(() => {
        router.push('/admin/crime');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to add crime');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-indigo-950 text-white transition-colors duration-500">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-20">
        <div className="particle-layer pointer-events-none"></div>
        <div className="shimmer-layer pointer-events-none"></div>
      </div>

      <Sidebar />

      <main className="ml-0 p-4 transition-all duration-300 md:ml-[80px] md:p-8 lg:ml-[260px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-4xl"
        >
          <AdminHeader
            title="Add New Crime Type"
            backUrl="/admin/crime"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800 bg-opacity-60 p-8 rounded-xl border border-gray-700"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Crime Name</label>
                <input
                  type="text"
                  value={crimeData.name}
                  onChange={(e) => setCrimeData({ ...crimeData, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={crimeData.description}
                  onChange={(e) => setCrimeData({ ...crimeData, description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">Category</label>
                  <select
                    value={crimeData.categoryId}
                    onChange={(e) => setCrimeData({ ...crimeData, categoryId: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Priority</label>
                  <select
                    value={crimeData.priority}
                    onChange={(e) => setCrimeData({ ...crimeData, priority: e.target.value as any })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="immediate"
                  checked={crimeData.requiresImmediateAttention}
                  onChange={(e) => setCrimeData({ ...crimeData, requiresImmediateAttention: e.target.checked })}
                  className="w-5 h-5 mr-3 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="immediate" className="text-gray-300">
                  Requires Immediate Attention
                </label>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading || categories.length === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Crime Type'}
                </button>
              </div>

              {error && (
                <div className="bg-red-900 text-red-200 p-4 rounded-lg border border-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-900 text-green-200 p-4 rounded-lg border border-green-700">
                  {success}
                </div>
              )}
            </form>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}