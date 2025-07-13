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
}

interface CrimeType {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresImmediateAttention: boolean;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AddCrimePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CrimeCategory[]>([]);
  const [crimeData, setCrimeData] = useState<CrimeType>({
    id: 0,
    name: '',
    description: '',
    categoryId: 0,
    categoryName: '',
    priority: 'MEDIUM',
    requiresImmediateAttention: false,
    createdAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [crimes, setCrimes] = useState<CrimeType[]>([]);
  const [crimesLoading, setCrimesLoading] = useState(true);
  const [crimesError, setCrimesError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme === 'light' ? 'light' : 'dark');
    } else {
      setTheme('dark');
    }
    fetchCategories();
    fetchCrimes();
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
    try {
      const response = await fetch(`${API_URL}/api/crime-categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
      if (data.length > 0 && crimeData.categoryId === 0) {
        setCrimeData(prev => ({ ...prev, categoryId: data[0].id }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    }
  };

  const fetchCrimes = async () => {
    setCrimesLoading(true);
    setCrimesError('');
    try {
      const response = await fetch(`${API_URL}/api/crimes/dto`);
      if (!response.ok) {
        throw new Error('Failed to fetch crimes');
      }
      const data = await response.json();
      setCrimes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setCrimesError(err.message || 'Failed to fetch crimes');
    } finally {
      setCrimesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { createdAt, id, categoryName, ...dataToSend } = crimeData;
      const payload = {
        ...dataToSend,
        category: { id: crimeData.categoryId }
      };

      const response = await fetch(`${API_URL}/api/crimes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `Failed to add crime type`;
        try {
          const clonedResponse = response.clone();
          const errorData = await clonedResponse.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (jsonErr) {
          try {
            const text = await response.text();
            errorMessage = text;
          } catch (_) {}
        }
        throw new Error(errorMessage);
      }

      setSuccess(`Crime type added successfully!`);
      setCrimeData({
        id: 0,
        name: '',
        description: '',
        categoryId: categories.length > 0 ? categories[0].id : 0,
        categoryName: '',
        priority: 'MEDIUM',
        requiresImmediateAttention: false,
        createdAt: '',
      });
      fetchCrimes();
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || `Failed to add crime type`);
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

  const filteredCrimes = crimes.filter(crime =>
    crime.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crime.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crime.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-indigo-950 text-white transition-colors duration-500 dark:from-gray-950 dark:to-indigo-950 light:from-blue-50 light:to-purple-50 light:text-gray-900">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-20">
        <div className="particle-layer"></div>
        <div className="shimmer-layer"></div>
      </div>

      <Sidebar />

      <main className="ml-0 p-4 transition-all duration-300 md:ml-[80px] md:p-8 lg:ml-[260px]">
        <AdminHeader
          title="Manage Crime Types"
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
              <h3 className="text-xl font-bold text-blue-300 light:text-blue-700">
                Add New Crime Type
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div>
                <label htmlFor="crimeName" className="block text-gray-300 mb-2 font-medium light:text-gray-700">Crime Name</label>
                <input
                  id="crimeName"
                  type="text"
                  value={crimeData.name}
                  onChange={(e) => setCrimeData({ ...crimeData, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200
                  light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
                  placeholder="e.g., Burglary, Assault, Cyber Fraud"
                  required
                />
              </div>

              <div>
                <label htmlFor="crimeDescription" className="block text-gray-300 mb-2 font-medium light:text-gray-700">Description</label>
                <textarea
                  id="crimeDescription"
                  value={crimeData.description}
                  onChange={(e) => setCrimeData({ ...crimeData, description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-y
                  min-h-[100px]
                  light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
                  rows={4}
                  placeholder="Provide a detailed description of this crime type."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="crimeCategory" className="block text-gray-300 mb-2 font-medium light:text-gray-700">Category</label>
                  <select
                    id="crimeCategory"
                    value={crimeData.categoryId}
                    onChange={(e) => setCrimeData({ ...crimeData, categoryId: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200
                    light:bg-gray-100 light:border-gray-300 light:text-gray-900"
                    required
                  >
                    {categories.length === 0 ? (
                        <option value="">Loading categories...</option>
                    ) : (
                        categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="crimePriority" className="block text-gray-300 mb-2 font-medium light:text-gray-700">Priority</label>
                  <select
                    id="crimePriority"
                    value={crimeData.priority}
                    onChange={(e) => setCrimeData({ ...crimeData, priority: e.target.value as CrimeType['priority'] })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200
                    light:bg-gray-100 light:border-gray-300 light:text-gray-900"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="requiresImmediateAttention"
                  checked={crimeData.requiresImmediateAttention}
                  onChange={(e) => setCrimeData({ ...crimeData, requiresImmediateAttention: e.target.checked })}
                  className="w-5 h-5 mr-3 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 transition-all duration-200
                  light:bg-gray-100 light:border-gray-300 light:checked:bg-blue-600 light:focus:ring-blue-500"
                />
                <label htmlFor="requiresImmediateAttention" className="text-gray-300 font-medium light:text-gray-700">
                  Requires Immediate Attention
                </label>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || categories.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold text-lg tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                  light:bg-blue-700 light:hover:bg-blue-800 light:text-white"
                >
                  {loading ? 'Adding Crime...' : 'Add Crime Type'}
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
              <h3 className="text-xl font-bold text-purple-300 light:text-purple-700">Existing Crime Types</h3>
              <Button
                onClick={fetchCrimes}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-4 py-2 rounded-md text-sm transition-all duration-200
                light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700 light:hover:text-gray-900"
                title="Refresh Crime Types"
              >
                Refresh
              </Button>
            </div>

            <div className="p-6">
              <input
                type="text"
                placeholder="Search crime types by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 mb-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200
                light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
              />
            </div>

            <div className="overflow-y-auto max-h-[400px]">
              <table className="w-full">
                <thead>
                  <tr className="sticky top-0 bg-gray-800 bg-opacity-70 backdrop-blur-sm border-b border-gray-700 text-left text-gray-400 light:bg-white light:bg-opacity-80 light:border-gray-300 light:text-gray-600 z-10">
                    <th className="p-4">Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4 text-center">Immediate</th>
                    <th className="p-4">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {crimesLoading ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-400 light:text-gray-600">
                        Loading crime types...
                      </td>
                    </tr>
                  ) : crimesError ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-red-400 light:text-red-600">
                        {crimesError}
                      </td>
                    </tr>
                  ) : filteredCrimes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-400 light:text-gray-600">
                        No crime types found matching your search or added yet.
                      </td>
                    </tr>
                  ) : (
                    filteredCrimes.map((crime) => (
                      <motion.tr
                        key={crime.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-gray-800 hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200
                        light:border-gray-200 light:hover:bg-gray-100"
                      >
                        <td className="p-4 font-medium text-blue-200 light:text-blue-700">{crime.name}</td>
                        <td className="p-4 text-gray-400">{crime.categoryName}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold
                              ${crime.priority === 'HIGH' ? 'bg-red-600 text-white' :
                                crime.priority === 'MEDIUM' ? 'bg-yellow-500 text-black' :
                                'bg-green-500 text-white'}
                              light:${crime.priority === 'HIGH' ? 'bg-red-200 text-red-800' :
                                crime.priority === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-green-200 text-green-800'}`}
                          >
                            {crime.priority}
                          </span>
                        </td>
                        <td className="p-4 flex justify-center items-center">
                          {crime.requiresImmediateAttention ? (
                            <span className="text-green-500 text-lg">&#10003;</span>
                          ) : (
                            <span className="text-red-500 text-lg">&#10006;</span>
                          )}
                        </td>
                        <td className="p-4 text-gray-400 text-sm light:text-gray-600">
                          {formatTimestamp(crime.createdAt)}
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