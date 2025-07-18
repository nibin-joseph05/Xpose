'use client';

import { useState, useEffect, useMemo } from 'react';
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
  categoryName: string;
  categoryId: number;
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

  const [currentPageCrimes, setCurrentPageCrimes] = useState(1);
  const [itemsPerPageCrimes] = useState(10);

  const [currentPageCategories, setCurrentPageCategories] = useState(1);
  const [itemsPerPageCategories] = useState(10);

  const [crimeSearchQuery, setCrimeSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

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

      const crimesResponse = await fetch(`${API_URL}/api/crimes/dto`);
      if (!crimesResponse.ok) throw new Error('Failed to fetch crime types');
      const crimesData = await crimesResponse.json();
      setCrimeTypes(Array.isArray(crimesData) ? crimesData : []);

      const categoriesResponse = await fetch(`${API_URL}/api/crime-categories`);
      if (!categoriesResponse.ok) throw new Error('Failed to fetch crime categories');
      const categoriesData = await categoriesResponse.json();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-300 ring-1 ring-inset ring-red-600/30 light:bg-red-100 light:text-red-800 light:ring-red-300">High</span>;
      case 'MEDIUM':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-600/20 text-yellow-300 ring-1 ring-inset ring-yellow-600/30 light:bg-yellow-100 light:text-yellow-800 light:ring-yellow-300">Medium</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 ring-1 ring-inset ring-green-600/30 light:bg-green-100 light:text-green-800 light:ring-green-300">Low</span>;
    }
  };

  const filteredCrimeTypes = useMemo(() => {
    return crimeTypes.filter(crime =>
      crime.name.toLowerCase().includes(crimeSearchQuery.toLowerCase()) ||
      crime.description.toLowerCase().includes(crimeSearchQuery.toLowerCase()) ||
      crime.categoryName.toLowerCase().includes(crimeSearchQuery.toLowerCase())
    );
  }, [crimeTypes, crimeSearchQuery]);

  const totalPagesCrimes = Math.ceil(filteredCrimeTypes.length / itemsPerPageCrimes);
  const paginatedCrimeTypes = useMemo(() => {
    const startIndex = (currentPageCrimes - 1) * itemsPerPageCrimes;
    const endIndex = startIndex + itemsPerPageCrimes;
    return filteredCrimeTypes.slice(startIndex, endIndex);
  }, [filteredCrimeTypes, currentPageCrimes, itemsPerPageCrimes]);

  const handlePageChangeCrimes = (page: number) => {
    setCurrentPageCrimes(page);
  };

  const handleDeleteCrimeType = async (id: number) => {
    if (confirm('Are you sure you want to delete this crime type?')) {
      try {
        const response = await fetch(`${API_URL}/api/crimes/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete crime type');
        }
        setCrimeTypes(prev => prev.filter(crime => crime.id !== id));
        alert('Crime type deleted successfully!');
      } catch (err: any) {
        console.error('Error deleting crime type:', err);
        setError(err.message || 'Error deleting crime type.');
      }
    }
  };

  const handleEditCrimeType = (id: number) => {
    router.push(`/admin/crime/edit-crime/${id}`);
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(categorySearchQuery.toLowerCase())
    );
  }, [categories, categorySearchQuery]);

  const totalPagesCategories = Math.ceil(filteredCategories.length / itemsPerPageCategories);
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPageCategories - 1) * itemsPerPageCategories;
    const endIndex = startIndex + itemsPerPageCategories;
    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, currentPageCategories, itemsPerPageCategories]);

  const handlePageChangeCategories = (page: number) => {
    setCurrentPageCategories(page);
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('Are you sure you want to delete this crime category? You will not be able to delete it if it is linked to any crime types.')) {
      try {
        const response = await fetch(`${API_URL}/api/crime-categories/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete category');
        }
        setCategories(prev => prev.filter(category => category.id !== id));
        alert('Category deleted successfully!');
      } catch (err: any) {
        console.error('Error deleting category:', err);
        setError(err.message || 'Error deleting category.');
      }
    }
  };

  const handleEditCategory = (id: number) => {
    router.push(`/admin/crime/edit-category/${id}`);
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
          <AdminHeader title="Crime Management" />

          <div className="pt-8 flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-blue-400 light:text-blue-700">Crime Types & Categories</h2>
            <div className="flex space-x-4">
              <Button
                onClick={() => router.push('/admin/crime/add-category')}
                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg
                transform hover:scale-105 transition-all duration-300 ease-out"
              >
                Add Category
              </Button>
              <Button
                onClick={() => router.push('/admin/crime/add-crime')}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg
                transform hover:scale-105 transition-all duration-300 ease-out"
              >
                Add Crime Type
              </Button>
            </div>
          </div>

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
            className="mb-12 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl
            dark:hover:border-blue-600 transition-all duration-300
            light:border-gray-300 light:bg-white light:bg-opacity-80 light:hover:border-blue-500"
          >
            <div className="border-b border-gray-700 p-6 flex justify-between items-center flex-wrap gap-4 light:border-gray-300">
              <h3 className="text-xl font-bold text-blue-300 light:text-blue-700">Crime Types</h3>
              <input
                type="text"
                placeholder="Search crime types..."
                value={crimeSearchQuery}
                onChange={(e) => {
                  setCrimeSearchQuery(e.target.value);
                  setCurrentPageCrimes(1);
                }}
                className="flex-grow max-w-sm bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-gray-800 bg-opacity-70 backdrop-blur-sm border-b border-gray-700 text-gray-400 light:bg-white light:bg-opacity-80 light:border-gray-300 light:text-gray-600 z-10">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4 text-center">Immediate</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-400 light:text-gray-600">
                        Loading crime types...
                      </td>
                    </tr>
                  ) : filteredCrimeTypes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-400 light:text-gray-600">
                        No crime types found matching your search.
                      </td>
                    </tr>
                  ) : (
                    paginatedCrimeTypes.map((crime) => (
                      <motion.tr
                        key={crime.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-gray-800 hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200
                        light:border-gray-200 light:hover:bg-gray-100"
                      >
                        <td className="p-4 font-medium text-blue-200 light:text-gray-800">{crime.name}</td>
                        <td className="p-4 text-gray-400 text-sm light:text-gray-700 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{crime.description}</td>
                        <td className="p-4 text-gray-400 light:text-gray-700">{crime.categoryName || 'Uncategorized'}</td>
                        <td className="p-4">{getPriorityBadge(crime.priority)}</td>
                        <td className="p-4 text-center">
                          {crime.requiresImmediateAttention ? (
                            <span className="text-green-500 text-lg">&#10003;</span>
                          ) : (
                            <span className="text-red-500 text-lg">&#10006;</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleEditCrimeType(crime.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-blue-400 hover:bg-blue-800/50 hover:text-blue-300 transition-colors duration-200
                            light:text-blue-600 light:hover:bg-blue-100 light:hover:text-blue-800"
                            title="Edit Crime Type"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCrimeType(crime.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-red-400 hover:bg-red-800/50 hover:text-red-300 transition-colors duration-200 ml-2
                            light:text-red-600 light:hover:bg-red-100 light:hover:text-red-800"
                            title="Delete Crime Type"
                          >
                            Del
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPagesCrimes > 1 && (
              <div className="p-4 flex justify-center items-center space-x-2 border-t border-gray-700 light:border-gray-300">
                <Button
                  onClick={() => handlePageChangeCrimes(currentPageCrimes - 1)}
                  disabled={currentPageCrimes === 1}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white disabled:opacity-50 light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPagesCrimes }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => handlePageChangeCrimes(page)}
                    className={`px-3 py-1 rounded ${
                      currentPageCrimes === page
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700'
                    }`}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  onClick={() => handlePageChangeCrimes(currentPageCrimes + 1)}
                  disabled={currentPageCrimes === totalPagesCrimes}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white disabled:opacity-50 light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700"
                >
                  Next
                </Button>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl
            dark:hover:border-purple-600 transition-all duration-300
            light:border-gray-300 light:bg-white light:bg-opacity-80 light:hover:border-purple-500"
          >
            <div className="border-b border-gray-700 p-6 flex justify-between items-center flex-wrap gap-4 light:border-gray-300">
              <h3 className="text-xl font-bold text-blue-300 light:text-blue-700">Crime Categories</h3>
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearchQuery}
                onChange={(e) => {
                  setCategorySearchQuery(e.target.value);
                  setCurrentPageCategories(1);
                }}
                className="flex-grow max-w-sm bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500
                light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-gray-800 bg-opacity-70 backdrop-blur-sm border-b border-gray-700 text-gray-400 light:bg-white light:bg-opacity-80 light:border-gray-300 light:text-gray-600 z-10">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-400 light:text-gray-600">
                        Loading categories...
                      </td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-400 light:text-gray-600">
                        No categories found matching your search.
                      </td>
                    </tr>
                  ) : (
                    paginatedCategories.map((category) => (
                      <motion.tr
                        key={category.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-gray-800 hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200
                        light:border-gray-200 light:hover:bg-gray-100"
                      >
                        <td className="p-4 font-medium text-blue-200 light:text-gray-800">{category.name}</td>
                        <td className="p-4 text-gray-400 text-sm light:text-gray-700 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{category.description || 'No description'}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleEditCategory(category.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-blue-400 hover:bg-blue-800/50 hover:text-blue-300 transition-colors duration-200
                            light:text-blue-600 light:hover:bg-blue-100 light:hover:text-blue-800"
                            title="Edit Category"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-red-400 hover:bg-red-800/50 hover:text-red-300 transition-colors duration-200 ml-2
                            light:text-red-600 light:hover:bg-red-100 light:hover:text-red-800"
                            title="Delete Category"
                          >
                            Del
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPagesCategories > 1 && (
              <div className="p-4 flex justify-center items-center space-x-2 border-t border-gray-700 light:border-gray-300">
                <Button
                  onClick={() => handlePageChangeCategories(currentPageCategories - 1)}
                  disabled={currentPageCategories === 1}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white disabled:opacity-50 light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPagesCategories }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => handlePageChangeCategories(page)}
                    className={`px-3 py-1 rounded ${
                      currentPageCategories === page
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700'
                    }`}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  onClick={() => handlePageChangeCategories(currentPageCategories + 1)}
                  disabled={currentPageCategories === totalPagesCategories}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white disabled:opacity-50 light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700"
                >
                  Next
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}