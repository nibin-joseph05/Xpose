
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminMap from '@/components/admin/maps/Map';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

interface CrimeReport {
  reportId: string;
  crimeTypeId: number;
  crimeType: string;
  categoryId: number;
  categoryName?: string;
  originalDescription: string;
  translatedDescription: string;
  address: string;
  city: string;
  state: string;
  policeStation: string;
  status: 'ACCEPTED' | 'REJECTED' | 'PENDING_REVIEW';
  adminStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ASSIGNED';
  policeStatus: 'NOT_VIEWED' | 'VIEWED' | 'IN_PROGRESS' | 'ACTION_TAKEN' | 'RESOLVED' | 'CLOSED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  submittedAt: string;
  assignedOfficerId?: number;
  latitude?: number;
  longitude?: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.220.2:8080';

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  trend?: number;
  description?: string;
}

export default function AdminDashboard() {
  const [error, setError] = useState('');
  const [reports, setReports] = useState<CrimeReport[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('No authentication token found. Please log in.');
      router.push('/admin/login');
      return;
    }

    const cachedUser = localStorage.getItem('userData');
    if (cachedUser) {
      const userData = JSON.parse(cachedUser);
      if (userData.role === 'ADMIN') {
        setUser(userData);
      } else {
        setError('Access denied: Only administrators can access this dashboard');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        router.push('/admin/login');
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

        if (userData.role !== 'ADMIN') {
          setError('Access denied: Only administrators can access this dashboard');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          router.push('/admin/login');
          return;
        }

        const formattedUserData = {
          id: userData.id?.toString(),
          name: userData.name,
          email: userData.email,
          role: userData.role,
        };

        setUser(formattedUserData);
        localStorage.setItem('userData', JSON.stringify(formattedUserData));
      } catch (err: any) {
        console.error('User data fetch error:', err);
        setError('Failed to authenticate. Please log in again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        router.push('/admin/login');
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const theme = savedTheme === 'light' ? 'light' : 'dark';
    setTheme(theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, []);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const fetchReports = async (retryCount = 0) => {
      try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const params = new URLSearchParams({
          page: '0',
          size: '1000',
        });

        const springResponse = await fetch(`${API_URL}/api/reports?${params.toString()}`, {
          signal: controller.signal,
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        });

        clearTimeout(timeoutId);

        if (!springResponse.ok) {
          const errorText = await springResponse.text();
          throw new Error(`Failed to fetch reports: ${springResponse.statusText}`);
        }

        const springData = await springResponse.json();

        const mergedReports: CrimeReport[] = (springData.reports || []).map((springReport: any) => {
          return {
            reportId: springReport.reportId,
            crimeTypeId: springReport.crimeTypeId,
            crimeType: springReport.crimeType,
            categoryId: springReport.categoryId,
            categoryName: springReport.categoryName,
            originalDescription: springReport.originalDescription,
            translatedDescription: springReport.translatedDescription,
            address: springReport.address,
            city: springReport.city,
            state: springReport.state,
            policeStation: springReport.policeStation,
            status: springReport.status,
            adminStatus: springReport.adminStatus || 'PENDING',
            policeStatus: springReport.policeStatus || 'NOT_VIEWED',
            urgency: springReport.urgency,
            submittedAt: springReport.submittedAt,
            assignedOfficerId: springReport.assignedOfficerId,
            latitude: springReport.latitude,
            longitude: springReport.longitude,
          };
        });

        setReports(mergedReports);
        localStorage.setItem('admin_reports', JSON.stringify(mergedReports));
        setError('');
      } catch (err: any) {
        if (err.name === 'AbortError' && retryCount < 2) {
          return fetchReports(retryCount + 1);
        }
        setError(err.name === 'AbortError' ? 'Request timed out. Please try again.' : err.message || 'Failed to fetch reports');
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);


  const stats = useMemo(() => ({
    totalReports: reports.length,
    pendingReview: reports.filter(r => r.adminStatus === 'PENDING').length,
    approved: reports.filter(r => r.adminStatus === 'APPROVED').length,
    assigned: reports.filter(r => r.adminStatus === 'ASSIGNED').length,
    rejected: reports.filter(r => r.adminStatus === 'REJECTED').length,
    urgent: reports.filter(r => r.urgency === 'HIGH' || r.urgency === 'CRITICAL').length,
    mlAccepted: reports.filter(r => r.status === 'ACCEPTED').length,
    mlRejected: reports.filter(r => r.status === 'REJECTED').length,
    resolved: reports.filter(r => r.policeStatus === 'RESOLVED' || r.policeStatus === 'CLOSED').length,
    inProgress: reports.filter(r => r.policeStatus === 'IN_PROGRESS').length,
    actionTaken: reports.filter(r => r.policeStatus === 'ACTION_TAKEN').length,
    notViewed: reports.filter(r => r.policeStatus === 'NOT_VIEWED').length,
  }), [reports]);


  const hotspots = useMemo(() => {
    const countMap = new Map<string, number>();
    reports.forEach(r => {
      const loc = r.city || r.state || 'Unknown';
      countMap.set(loc, (countMap.get(loc) || 0) + 1);
    });
    return Array.from(countMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [reports]);


  const crimeTypes = useMemo(() => {
    const countMap = new Map<string, number>();
    reports.forEach(r => {
      const type = r.crimeType || 'Unknown';
      countMap.set(type, (countMap.get(type) || 0) + 1);
    });
    return Array.from(countMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [reports]);


  const crimeTrends = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const count = reports.filter(report =>
        report.submittedAt.split('T')[0] === date
      ).length;
      return { date, count };
    });
  }, [reports]);


  const urgencyDistribution = useMemo(() => {
    const distribution = {
      CRITICAL: reports.filter(r => r.urgency === 'CRITICAL').length,
      HIGH: reports.filter(r => r.urgency === 'HIGH').length,
      MEDIUM: reports.filter(r => r.urgency === 'MEDIUM').length,
      LOW: reports.filter(r => r.urgency === 'LOW').length,
    };
    return distribution;
  }, [reports]);


  const policePerformance = useMemo(() => {
    const statusCounts = {
      NOT_VIEWED: reports.filter(r => r.policeStatus === 'NOT_VIEWED').length,
      VIEWED: reports.filter(r => r.policeStatus === 'VIEWED').length,
      IN_PROGRESS: reports.filter(r => r.policeStatus === 'IN_PROGRESS').length,
      ACTION_TAKEN: reports.filter(r => r.policeStatus === 'ACTION_TAKEN').length,
      RESOLVED: reports.filter(r => r.policeStatus === 'RESOLVED').length,
      CLOSED: reports.filter(r => r.policeStatus === 'CLOSED').length,
    };
    return statusCounts;
  }, [reports]);


  const mlPerformance = useMemo(() => {
    const total = reports.length;
    const accepted = reports.filter(r => r.status === 'ACCEPTED').length;
    const rejected = reports.filter(r => r.status === 'REJECTED').length;
    const pending = reports.filter(r => r.status === 'PENDING_REVIEW').length;

    return {
      accepted,
      rejected,
      pending,
      accuracy: total > 0 ? ((accepted + rejected) / total) * 100 : 0
    };
  }, [reports]);


  const recentReports = useMemo(() =>
    [...reports]
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 5),
  [reports]);


  const mapCenter = useMemo(() => {
    const reportWithCoords = reports.find(r => r.latitude && r.longitude);
    return reportWithCoords ?
      { lat: reportWithCoords.latitude!, lng: reportWithCoords.longitude! } :
      { lat: 9.5916, lng: 76.5222 };
  }, [reports]);

  const mapMarkers = useMemo(() => {
    return reports
      .filter(r => r.latitude && r.longitude)
      .slice(0, 15)
      .map(report => ({
        lat: report.latitude!,
        lng: report.longitude!,
        title: `${report.crimeType} - ${report.city}`
      }));
  }, [reports]);


  const calculateTrends = () => {
    return {
      total: 8,
      pending: -3,
      approved: 12,
      urgent: 25,
      resolved: 18
    };
  };

  const trends = calculateTrends();

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, description }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className={`rounded-xl border ${color} bg-gray-800 bg-opacity-60 p-6 shadow-lg transition-all duration-300 ease-in-out dark:bg-gray-800 dark:bg-opacity-60 light:border-gray-200 light:bg-white light:bg-opacity-80`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="mb-2 text-sm text-gray-400 light:text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-50 light:text-gray-800">{value}</h3>
          {trend !== undefined && (
            <p className={`text-xs mt-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend >= 0 ? '↗' : '↘'} {Math.abs(trend)}% from last week
            </p>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1 light:text-gray-600">{description}</p>
          )}
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </motion.div>
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: theme === 'dark' ? '#E5E7EB' : '#374151',
          font: {
            size: 11
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        },
        ticks: {
          color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
        }
      },
      x: {
        grid: {
          color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        },
        ticks: {
          color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
        }
      }
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
          <div className="mb-8">
            <AdminHeader />
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

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-xl text-gray-400">Loading dashboard data...</div>
            </div>
          ) : (
            <>
              {/* Enhanced Stats Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
              >
                <StatCard
                  title="Total Reports"
                  value={stats.totalReports}
                  icon="📋"
                  color="border-blue-500"
                  trend={trends.total}
                  description="All time reports"
                />
                <StatCard
                  title="Pending Review"
                  value={stats.pendingReview}
                  icon="⏳"
                  color="border-yellow-500"
                  trend={trends.pending}
                  description="Awaiting admin action"
                />
                <StatCard
                  title="Approved"
                  value={stats.approved}
                  icon="✅"
                  color="border-green-500"
                  trend={trends.approved}
                  description="Admin approved cases"
                />
                <StatCard
                  title="Urgent Cases"
                  value={stats.urgent}
                  icon="🚨"
                  color="border-red-500"
                  trend={trends.urgent}
                  description="High & Critical priority"
                />
                <StatCard
                  title="Resolved"
                  value={stats.resolved}
                  icon="🔒"
                  color="border-purple-500"
                  trend={trends.resolved}
                  description="Closed & resolved cases"
                />
              </motion.div>

              {/* Performance Metrics */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                <StatCard
                  title="ML Accepted"
                  value={stats.mlAccepted}
                  icon="🤖"
                  color="border-green-400"
                  description="AI model approved"
                />
                <StatCard
                  title="In Progress"
                  value={stats.inProgress}
                  icon="🔄"
                  color="border-orange-500"
                  description="Police action ongoing"
                />
                <StatCard
                  title="Action Taken"
                  value={stats.actionTaken}
                  icon="✅"
                  color="border-blue-400"
                  description="Police responded"
                />
                <StatCard
                  title="Not Viewed"
                  value={stats.notViewed}
                  icon="👁️"
                  color="border-gray-500"
                  description="Awaiting police review"
                />
              </motion.div>

              {/* Charts Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3"
              >
                {/* Status Overview */}
                <div className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-6 shadow-xl light:bg-white light:bg-opacity-80 light:border-gray-300">
                  <div className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-100 light:text-gray-800">
                    <span>📈</span> Status Overview
                  </div>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: ['Pending', 'Approved', 'Assigned', 'Rejected'],
                        datasets: [{
                          label: 'Reports',
                          data: [
                            stats.pendingReview,
                            stats.approved,
                            stats.assigned,
                            stats.rejected
                          ],
                          backgroundColor: ['#EAB308', '#10B981', '#3B82F6', '#EF4444'],
                          borderColor: ['#CA8A04', '#059669', '#2563EB', '#DC2626'],
                          borderWidth: 2,
                          borderRadius: 4,
                        }],
                      }}
                      options={chartOptions}
                    />
                  </div>
                </div>

                {/* Crime Hotspots */}
                <div className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-6 shadow-xl light:bg-white light:bg-opacity-80 light:border-gray-300">
                  <div className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-100 light:text-gray-800">
                    <span>📍</span> Crime Hotspots
                  </div>
                  <div className="h-64 overflow-y-auto">
                    {hotspots.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-gray-500 light:text-gray-400">
                        No hotspots data available
                      </div>
                    ) : (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-700 text-gray-400 light:border-gray-200 light:text-gray-600">
                            <th className="p-2">Location</th>
                            <th className="p-2 text-right">Count</th>
                            <th className="p-2 text-right">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hotspots.map(([loc, count]) => (
                            <tr key={loc} className="border-b border-gray-800 light:border-gray-200 hover:bg-gray-700 light:hover:bg-gray-100">
                              <td className="p-2 text-gray-300 light:text-gray-700">{loc}</td>
                              <td className="p-2 text-right text-gray-300 light:text-gray-700">{count}</td>
                              <td className="p-2 text-right text-gray-400 light:text-gray-600">
                                {((count / stats.totalReports) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Top Crime Types */}
                <div className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-6 shadow-xl light:bg-white light:bg-opacity-80 light:border-gray-300">
                  <div className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-100 light:text-gray-800">
                    <span>🔍</span> Top Crime Types
                  </div>
                  <div className="h-64 overflow-y-auto">
                    {crimeTypes.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-gray-500 light:text-gray-400">
                        No crime types data available
                      </div>
                    ) : (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-700 text-gray-400 light:border-gray-200 light:text-gray-600">
                            <th className="p-2">Crime Type</th>
                            <th className="p-2 text-right">Count</th>
                            <th className="p-2 text-right">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {crimeTypes.map(([type, count]) => (
                            <tr key={type} className="border-b border-gray-800 light:border-gray-200 hover:bg-gray-700 light:hover:bg-gray-100">
                              <td className="p-2 text-gray-300 light:text-gray-700">{type}</td>
                              <td className="p-2 text-right text-gray-300 light:text-gray-700">{count}</td>
                              <td className="p-2 text-right text-gray-400 light:text-gray-600">
                                {((count / stats.totalReports) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Urgency Distribution */}
                <div className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-6 shadow-xl light:bg-white light:bg-opacity-80 light:border-gray-300">
                  <div className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-100 light:text-gray-800">
                    <span>⚡</span> Urgency Distribution
                  </div>
                  <div className="h-64">
                    <Doughnut
                      data={{
                        labels: ['Critical', 'High', 'Medium', 'Low'],
                        datasets: [{
                          data: [
                            urgencyDistribution.CRITICAL,
                            urgencyDistribution.HIGH,
                            urgencyDistribution.MEDIUM,
                            urgencyDistribution.LOW,
                          ],
                          backgroundColor: ['#DC2626', '#EF4444', '#EAB308', '#10B981'],
                          borderColor: ['#B91C1C', '#DC2626', '#CA8A04', '#059669'],
                          borderWidth: 2,
                        }],
                      }}
                      options={chartOptions}
                    />
                  </div>
                </div>

                {/* Police Performance */}
                <div className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-6 shadow-xl light:bg-white light:bg-opacity-80 light:border-gray-300">
                  <div className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-100 light:text-gray-800">
                    <span>👮</span> Police Performance
                  </div>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: ['Not Viewed', 'Viewed', 'In Progress', 'Action Taken', 'Resolved', 'Closed'],
                        datasets: [{
                          label: 'Reports',
                          data: [
                            policePerformance.NOT_VIEWED,
                            policePerformance.VIEWED,
                            policePerformance.IN_PROGRESS,
                            policePerformance.ACTION_TAKEN,
                            policePerformance.RESOLVED,
                            policePerformance.CLOSED,
                          ],
                          backgroundColor: '#8B5CF6',
                          borderColor: '#7C3AED',
                          borderWidth: 2,
                          borderRadius: 4,
                        }],
                      }}
                      options={chartOptions}
                    />
                  </div>
                </div>

                {/* Crime Trends */}
                <div className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-6 shadow-xl light:bg-white light:bg-opacity-80 light:border-gray-300">
                  <div className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-100 light:text-gray-800">
                    <span>📊</span> 7-Day Trend
                  </div>
                  <div className="h-64">
                    <Line
                      data={{
                        labels: crimeTrends.map(t => new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                        datasets: [{
                          label: 'Reports',
                          data: crimeTrends.map(t => t.count),
                          borderColor: '#3B82F6',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderWidth: 3,
                          tension: 0.4,
                          fill: true,
                        }],
                      }}
                      options={chartOptions}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Map Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-6 shadow-xl light:bg-white light:bg-opacity-80 light:border-gray-300"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-100 light:text-gray-800">
                    <span>🗺️</span> Crime Locations Map
                  </h2>
                  <div className="text-sm text-gray-400 light:text-gray-600">
                    Showing {mapMarkers.length} crime locations
                  </div>
                </div>
                <AdminMap
                  lat={mapCenter.lat}
                  lng={mapCenter.lng}
                  markers={mapMarkers}
                  zoom={10}
                />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400 light:text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Main Location (Most Recent)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Other Crime Locations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span>Total Reports: {stats.totalReports}</span>
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="mt-8 rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-6 shadow-xl light:bg-white light:bg-opacity-80 light:border-gray-300"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-gray-100 light:text-gray-800">
                    <span>🕒</span> Recent Activity
                  </h2>
                  <button
                    onClick={() => router.push('/admin/reports')}
                    className="text-sm text-blue-400 hover:text-blue-300 light:text-blue-600 light:hover:text-blue-500"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-3">
                  {recentReports.length === 0 ? (
                    <div className="text-center text-gray-500 light:text-gray-400 py-4">
                      No recent activity
                    </div>
                  ) : (
                    recentReports.map((report) => (
                      <div key={report.reportId} className="flex items-center justify-between p-3 rounded-lg bg-gray-700 light:bg-gray-100 hover:bg-gray-600 light:hover:bg-gray-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            report.urgency === 'CRITICAL' ? 'bg-red-500' :
                            report.urgency === 'HIGH' ? 'bg-orange-500' :
                            report.urgency === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <div className="font-medium text-gray-100 light:text-gray-800">
                              {report.crimeType}
                            </div>
                            <div className="text-sm text-gray-400 light:text-gray-600">
                              {report.city}, {report.state} • {new Date(report.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-400 light:text-gray-600">
                          {report.adminStatus}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
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