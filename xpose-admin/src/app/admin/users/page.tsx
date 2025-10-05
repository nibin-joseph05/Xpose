'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/admin/ui/button';

interface User {
  id: number;
  mobile: string;
  name: string;
  email: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.220.2:8080';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme === 'light' ? 'light' : 'dark');
    } else {
      setTheme('dark');
    }
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/auth/users`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const maskMobile = (mobile: string) => {
    if (!mobile || mobile.length < 4) return '****';
    return '******' + mobile.slice(-2);
  };

  const normalizeString = (str: string) => {
    return str?.toLowerCase().replace(/\s+/g, '') || '';
  };

  const filteredUsers = useMemo(() => {
    const normalizedQuery = normalizeString(searchQuery);
    return users.filter(user =>
      user.id.toString().includes(searchQuery) ||
      (user.name && normalizeString(user.name).includes(normalizedQuery))
    );
  }, [users, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getAccountStatus = (user: User) => {
    return (user.name && user.email) ? 'Verified' : 'Basic';
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
          <AdminHeader title="Users Overview" />

          <div className="pt-8 mb-8">
            <h2 className="text-2xl font-bold text-blue-400 light:text-blue-700 mb-2">Registered Users</h2>
            <p className="text-gray-400 light:text-gray-600 text-sm">
              Overview of registered users. Personal information is protected for privacy and security.
            </p>
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
            className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="p-6 rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl light:border-gray-300 light:bg-white light:bg-opacity-80">
              <h4 className="text-sm font-semibold text-blue-300 mb-2 light:text-blue-700">Total Registered</h4>
              <p className="text-3xl font-bold text-white light:text-gray-900">{users.length}</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl light:border-gray-300 light:bg-white light:bg-opacity-80">
              <h4 className="text-sm font-semibold text-green-300 mb-2 light:text-green-700">Verified Accounts</h4>
              <p className="text-3xl font-bold text-white light:text-gray-900">
                {users.filter(u => u.name && u.email).length}
              </p>
            </div>
            <div className="p-6 rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl light:border-gray-300 light:bg-white light:bg-opacity-80">
              <h4 className="text-sm font-semibold text-purple-300 mb-2 light:text-purple-700">Basic Accounts</h4>
              <p className="text-3xl font-bold text-white light:text-gray-900">
                {users.filter(u => !u.name || !u.email).length}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl dark:hover:border-blue-600 transition-all duration-300 light:border-gray-300 light:bg-white light:bg-opacity-80 light:hover:border-blue-500"
          >
            <div className="border-b border-gray-700 p-6 flex justify-between items-center flex-wrap gap-4 light:border-gray-300">
              <h3 className="text-xl font-bold text-blue-300 light:text-blue-700">User Registry</h3>
              <input
                type="text"
                placeholder="Search by ID or name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-grow max-w-sm bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-gray-800 bg-opacity-70 backdrop-blur-sm border-b border-gray-700 text-gray-400 light:bg-white light:bg-opacity-80 light:border-gray-300 light:text-gray-600 z-10">
                  <tr>
                    <th className="p-4">User ID</th>
                    <th className="p-4">Display Name</th>
                    <th className="p-4">Contact Ref</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-400 light:text-gray-600">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-400 light:text-gray-600">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-gray-800 hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200 light:border-gray-200 light:hover:bg-gray-100"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-bold text-xs light:from-gray-300 light:to-gray-400">
                              {user.id.toString().slice(-2)}
                            </div>
                            <span className="font-mono text-sm text-blue-300 light:text-blue-700">
                              #{user.id.toString().padStart(6, '0')}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-gray-300 light:text-gray-800">
                          {user.name || 'Anonymous'}
                        </td>
                        <td className="p-4 text-gray-500 light:text-gray-600 text-sm font-mono">
                          {maskMobile(user.mobile)}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            getAccountStatus(user) === 'Verified'
                              ? 'bg-green-900/50 text-green-300 light:bg-green-100 light:text-green-700'
                              : 'bg-gray-700/50 text-gray-400 light:bg-gray-200 light:text-gray-600'
                          }`}>
                            {getAccountStatus(user)}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 light:text-gray-700 text-sm">
                          {formatTimestamp(user.createdAt)}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 flex justify-center items-center space-x-2 border-t border-gray-700 light:border-gray-300">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white disabled:opacity-50 light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700"
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700'
                      }`}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
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
            className="mt-6 p-4 rounded-lg border border-blue-700/50 bg-blue-900/20 light:border-blue-300 light:bg-blue-50"
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 light:text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-blue-300 light:text-blue-700 mb-1">Data Protection Notice</p>
                <p className="text-xs text-blue-400 light:text-blue-600">
                  All personal information is protected and masked. User details are only accessible through authorized investigation processes with proper legal documentation.
                </p>
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