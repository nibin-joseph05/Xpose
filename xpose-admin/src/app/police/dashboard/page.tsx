'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/police/Sidebar';
import PoliceHeader from '@/components/police/PoliceHeader';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

interface CrimeReport {
  reportId: string;
  crimeTypeId: number;
  crimeType: string;
  categoryId: number;
  categoryName?: string;
  description: string;
  translatedDescription: string;
  address: string;
  city: string;
  state: string;
  policeStation: string;
  status: 'ACCEPTED' | 'REJECTED' | 'RECEIVED_PENDING_REVIEW' | 'RECEIVED_HIGH_PRIORITY' | 'RECEIVED_MEDIUM_PRIORITY' | 'RECEIVED_STANDARD';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  submittedAt: string;
  assignedOfficerId?: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  stationId?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.220.2:8080';

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
}

export default function PoliceDashboard() {
  const [error, setError] = useState('');
  const [reports, setReports] = useState<CrimeReport[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('No authentication token found. Please log in.');
      router.push('/police/login');
      return;
    }

    const cachedUser = localStorage.getItem('userData');
    if (cachedUser) {
      const userData = JSON.parse(cachedUser);
      if (userData.role === 'POLICE') {
        setUser(userData);
      } else {
        setError('Access denied: Only police officers can access this dashboard');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        router.push('/police/login');
        return;
      }
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/authority/current`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }
        const userData = await response.json();

        console.log('👤 DEBUG: User data received:', userData);

        if (userData.role !== 'POLICE') {
          setError('Access denied: Only police officers can access this dashboard');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          router.push('/police/login');
          return;
        }

        const formattedUserData = {
          id: userData.id?.toString(),
          name: userData.name,
          email: userData.email,
          role: userData.role,
          stationId: userData.stationId?.toString() || userData.station?.id?.toString()
        };

        console.log('👤 DEBUG: Formatted user data:', formattedUserData);

        setUser(formattedUserData);
        localStorage.setItem('userData', JSON.stringify(formattedUserData));
      } catch (err: any) {
        console.error('User data fetch error:', err);
        setError('Failed to authenticate. Please log in again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        router.push('/police/login');
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme === 'light' ? 'light' : 'dark');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!user?.id) {
      console.log('⚠️ User data incomplete - missing ID:', user);
      return;
    }

    const fetchReports = async (retryCount = 0) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        console.log('🔍 DEBUG: Preparing to fetch reports for user:', {
          userId: user.id,
          stationId: user.stationId,
          userIdType: typeof user.id
        });

        const params = new URLSearchParams({
          page: '0',
          size: '1000',
          officerId: user.id
        });

        if (user.stationId) {
          params.append('stationId', user.stationId);
        }

        const reportsUrl = `${API_URL}/api/reports?${params.toString()}`;
        console.log('📡 DEBUG: Fetching from URL:', reportsUrl);

        const [springResponse, blockchainResponse] = await Promise.all([
          fetch(reportsUrl, {
            signal: controller.signal,
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
          }),
          fetch(`${API_URL}/api/reports/chain`, {
            signal: controller.signal,
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
          }),
        ]);

        clearTimeout(timeoutId);

        if (!springResponse.ok) {
          const errorText = await springResponse.text();
          console.error('❌ Spring API error:', springResponse.status, errorText);
          throw new Error(`Failed to fetch reports: ${springResponse.statusText}`);
        }
        if (!blockchainResponse.ok) {
          const errorText = await blockchainResponse.text();
          console.error('❌ Blockchain API error:', blockchainResponse.status, errorText);
          throw new Error(`Failed to fetch blockchain data: ${blockchainResponse.statusText}`);
        }

        const [springData, blockchainData] = await Promise.all([
          springResponse.json(),
          blockchainResponse.json(),
        ]);

        console.log('📊 DEBUG: Spring API response:', springData);
        console.log('🔗 DEBUG: Blockchain data count:', blockchainData?.length || 0);

        if (springData.reports && springData.reports.length > 0) {
          console.log('✅ DEBUG: Found reports:', springData.reports.length);
          console.log('📝 DEBUG: Sample report:', springData.reports[0]);
        } else {
          console.log('❌ DEBUG: No reports found in response');
        }

        const mergedReports: CrimeReport[] = (springData.reports || []).map((springReport: any) => {
          const blockchainReport = blockchainData?.find((block: any) => block.data?.reportId === springReport.reportId);

          return {
            reportId: springReport.reportId,
            crimeTypeId: springReport.crimeTypeId,
            crimeType: springReport.crimeType || 'Unknown',
            categoryId: springReport.categoryId,
            categoryName: springReport.categoryName,
            description: blockchainReport ? blockchainReport.data.description : springReport.originalDescription || 'No description',
            translatedDescription: blockchainReport ? blockchainReport.data.translatedText : springReport.translatedDescription || '',
            address: blockchainReport ? blockchainReport.data.address : springReport.address || 'Unknown',
            city: blockchainReport ? blockchainReport.data.city : springReport.city || 'Unknown',
            state: blockchainReport ? blockchainReport.data.state : springReport.state || 'Unknown',
            policeStation: springReport.policeStation || 'Unknown',
            status: springReport.status || 'RECEIVED_PENDING_REVIEW',
            urgency: springReport.urgency || 'LOW',
            submittedAt: blockchainReport ? blockchainReport.data.submittedAt : springReport.submittedAt || new Date().toISOString(),
            assignedOfficerId: springReport.assignedOfficerId,
          };
        });

        console.log('🎯 DEBUG: Final merged reports count:', mergedReports.length);

        setReports(mergedReports);
        localStorage.setItem(`reports_${user.id}`, JSON.stringify(mergedReports));

        if (mergedReports.length === 0) {
          setError(`No reports assigned to officer ID ${user.id}. Check if reports are properly assigned in the admin panel.`);
        } else {
          setError('');
        }
      } catch (err: any) {
        console.error('❌ Fetch error:', err);
        if (err.name === 'AbortError' && retryCount < 2) {
          console.log('🔄 DEBUG: Retrying fetch...');
          return fetchReports(retryCount + 1);
        }
        setError(err.name === 'AbortError' ? 'Request timed out. Please try again.' : err.message || 'Failed to fetch reports');
        setReports([]);
      }
    };

    fetchReports();
  }, [user]);

  const stats = useMemo(() => ({
    totalReports: reports.length,
    accepted: reports.filter(r => r.status === 'ACCEPTED').length,
    pending: reports.filter(r => r.status.startsWith('RECEIVED_')).length,
    urgent: reports.filter(r => r.urgency === 'HIGH').length,
  }), [reports]);

  const recentReports = useMemo(() =>
    [...reports]
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 5),
  [reports]);

  const hotspots = useMemo(() => {
    const countMap = new Map<string, number>();
    reports.forEach(r => {
      const loc = r.city || 'Unknown';
      countMap.set(loc, (countMap.get(loc) || 0) + 1);
    });
    return Array.from(countMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [reports]);

  const crimeTypes = useMemo(() => {
    const countMap = new Map<string, number>();
    reports.forEach(r => {
      const type = r.crimeType || 'Unknown';
      countMap.set(type, (countMap.get(type) || 0) + 1);
    });
    return Array.from(countMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [reports]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
      case 'RECEIVED_HIGH_PRIORITY':
      case 'RECEIVED_MEDIUM_PRIORITY':
      case 'RECEIVED_STANDARD':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 ring-1 ring-inset ring-green-600/30 light:bg-green-100 light:text-green-800 light:ring-green-300">
            Accepted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-300 ring-1 ring-inset ring-red-600/30 light:bg-red-100 light:text-red-800 light:ring-red-300">
            Rejected
          </span>
        );
      case 'RECEIVED_PENDING_REVIEW':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-600/20 text-yellow-300 ring-1 ring-inset ring-yellow-600/30 light:bg-yellow-100 light:text-yellow-800 light:ring-yellow-300">
            Pending Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-300 ring-1 ring-inset ring-gray-600/30 light:bg-gray-100 light:text-gray-800 light:ring-gray-300">
            Unknown
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-300 ring-1 ring-inset ring-red-600/30 light:bg-red-100 light:text-red-800 light:ring-red-300">
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-600/20 text-yellow-300 ring-1 ring-inset ring-yellow-600/30 light:bg-yellow-100 light:text-yellow-800 light:ring-yellow-300">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 ring-1 ring-inset ring-green-600/30 light:bg-green-100 light:text-green-800 light:ring-green-300">
            Low
          </span>
        );
    }
  };

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className={`rounded-xl border ${color} bg-gray-800 bg-opacity-60 p-4 shadow-lg transition-all duration-300 ease-in-out dark:bg-gray-800 dark:bg-opacity-60 light:border-gray-200 light:bg-white light:bg-opacity-80`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-sm text-gray-400 light:text-gray-600">{title}</p>
          <h3 className="text-xl font-bold text-gray-50 light:text-gray-800">{value}</h3>
        </div>
        <div className="text-2xl text-[#C3B091] light:text-[#8B7B5A]">{icon}</div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C3B091] to-[#8B7B5A] text-white transition-colors duration-500 dark:from-[#C3B091] dark:to-[#8B7B5A] light:from-[#E6D4A8] light:to-[#A69875]">
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
          <div className="mb-8">
            <PoliceHeader />
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
            transition={{ delay: 0.4 }}
            className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard
              title="Total Reports"
              value={stats.totalReports}
              icon="📋"
              color="border-[#C3B091]"
            />
            <StatCard
              title="Accepted"
              value={stats.accepted}
              icon="✅"
              color="border-green-500"
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              icon="⏳"
              color="border-yellow-500"
            />
            <StatCard
              title="Urgent"
              value={stats.urgent}
              icon="🚨"
              color="border-red-500"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl transition-colors duration-300 dark:bg-gray-800 dark:bg-opacity-60 light:border-gray-300 light:bg-white light:bg-opacity-80 light:text-gray-900"
          >
            <div className="border-b border-gray-700 p-6 light:border-gray-200">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-100 light:text-gray-800">
                <span>📰</span> Recent Reports
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-gray-300 light:text-gray-700">
                <thead>
                  <tr className="border-b border-gray-700 text-left text-gray-400 light:border-gray-200 light:text-gray-600">
                    <th className="p-4">ID</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-400 light:text-gray-600">
                        {user ? `No reports assigned to officer ID ${user.id}` : 'Loading...'}
                      </td>
                    </tr>
                  ) : (
                    recentReports.map((report) => (
                      <motion.tr
                        key={report.reportId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-gray-800 hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200 light:border-gray-200 light:hover:bg-gray-100"
                      >
                        <td className="p-4">{report.reportId}</td>
                        <td className="p-4">{report.crimeType}</td>
                        <td className="p-4">{report.city}</td>
                        <td className="p-4">{getStatusBadge(report.status)}</td>
                        <td className="p-4">{getPriorityBadge(report.urgency)}</td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-gray-700 p-4 light:border-gray-200">
              <button
                onClick={() => router.push('/police/reports')}
                className="flex items-center gap-2 text-[#C3B091] transition-colors hover:text-[#8B7B5A] light:text-[#8B7B5A] light:hover:text-[#7A6A49]"
              >
                View All Reports <span>→</span>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            <div className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-6 light:bg-white light:bg-opacity-80 light:border-gray-300">
              <div className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-100 light:text-gray-800">
                <span>📈</span> Reports Overview
              </div>
              <div className="h-64">
                <Bar
                  data={{
                    labels: ['Total', 'Accepted', 'Pending', 'Urgent'],
                    datasets: [{
                      label: 'Reports',
                      data: [stats.totalReports, stats.accepted, stats.pending, stats.urgent],
                      backgroundColor: ['#C3B091', '#22c55e', '#eab308', '#ef4444'],
                      borderColor: ['#A69875', '#16a34a', '#ca8a04', '#dc2626'],
                      borderWidth: 1,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Reports',
                          color: theme === 'dark' ? '#E6D4A8' : '#333333',
                        },
                        ticks: {
                          color: theme === 'dark' ? '#E6D4A8' : '#333333',
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Report Categories',
                          color: theme === 'dark' ? '#E6D4A8' : '#333333',
                        },
                        ticks: {
                          color: theme === 'dark' ? '#E6D4A8' : '#333333',
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: theme === 'dark' ? '#E6D4A8' : '#333333',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-6 light:bg-white light:bg-opacity-80 light:border-gray-300">
              <div className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-100 light:text-gray-800">
                <span>📍</span> Crime Hotspots
              </div>
              <div className="h-64 overflow-y-auto">
                {hotspots.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-gray-500 light:text-gray-400">No hotspots data available</div>
                ) : (
                  <table className="w-full text-left text-gray-300 light:text-gray-700">
                    <thead>
                      <tr className="border-b border-gray-700 text-gray-400 light:border-gray-200 light:text-gray-600">
                        <th className="p-2">Location</th>
                        <th className="p-2">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hotspots.map(([loc, count]) => (
                        <tr key={loc} className="border-b border-gray-800 light:border-gray-200">
                          <td className="p-2">{loc}</td>
                          <td className="p-2">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-6 light:bg-white light:bg-opacity-80 light:border-gray-300">
              <div className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-100 light:text-gray-800">
                <span>🔍</span> Top Crime Types
              </div>
              <div className="h-64 overflow-y-auto">
                {crimeTypes.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-gray-500 light:text-gray-400">No crime types data available</div>
                ) : (
                  <table className="w-full text-left text-gray-300 light:text-gray-700">
                    <thead>
                      <tr className="border-b border-gray-700 text-gray-400 light:border-gray-200 light:text-gray-600">
                        <th className="p-2">Crime Type</th>
                        <th className="p-2">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crimeTypes.map(([type, count]) => (
                        <tr key={type} className="border-b border-gray-800 light:border-gray-200">
                          <td className="p-2">{type}</td>
                          <td className="p-2">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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
          background: radial-gradient(circle at 10% 20%, rgba(195, 176, 145, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(139, 123, 90, 0.1) 0%, transparent 40%);
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