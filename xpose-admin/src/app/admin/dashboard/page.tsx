'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Bar } from 'react-chartjs-2';
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
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.220.2:8080';

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reports, setReports] = useState<CrimeReport[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme === 'light' ? 'light' : 'dark');
    } else {
      setTheme('dark');
    }
    fetchReports();
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

  const fetchReports = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const springResponse = await fetch(`${API_URL}/api/reports?page=0&size=1000`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!springResponse.ok) throw new Error('Failed to fetch reports from Spring Boot');
      const springData = await springResponse.json();

      const mergedReports: CrimeReport[] = springData.reports.map((springReport: any) => {
        const report = {
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
        };
        return report;
      });

      setReports(mergedReports);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(err.name === 'AbortError' ? 'Request timed out. Please check your network or server status.' : err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    totalReports: reports.length,
    mlAccepted: reports.filter(r => r.status === 'ACCEPTED').length,
    mlRejected: reports.filter(r => r.status === 'REJECTED').length,
    mlPending: reports.filter(r => r.status === 'PENDING_REVIEW').length,
    adminPending: reports.filter(r => r.adminStatus === 'PENDING').length,
    adminApproved: reports.filter(r => r.adminStatus === 'APPROVED').length,
    adminRejected: reports.filter(r => r.adminStatus === 'REJECTED').length,
    adminAssigned: reports.filter(r => r.adminStatus === 'ASSIGNED').length,
    policeNotViewed: reports.filter(r => r.policeStatus === 'NOT_VIEWED').length,
    policeInProgress: reports.filter(r => r.policeStatus === 'IN_PROGRESS').length,
    policeActionTaken: reports.filter(r => r.policeStatus === 'ACTION_TAKEN').length,
    policeResolved: reports.filter(r => r.policeStatus === 'RESOLVED').length,
    urgent: reports.filter(r => r.urgency === 'HIGH' || r.urgency === 'CRITICAL').length,
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
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 ring-1 ring-inset ring-green-600/30 light:bg-green-100 light:text-green-800 light:ring-green-300">
            ML: Accepted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-300 ring-1 ring-inset ring-red-600/30 light:bg-red-100 light:text-red-800 light:ring-red-300">
            ML: Rejected
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-600/20 text-yellow-300 ring-1 ring-inset ring-yellow-600/30 light:bg-yellow-100 light:text-yellow-800 light:ring-yellow-300">
            ML: Pending Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-300 ring-1 ring-inset ring-gray-600/30 light:bg-gray-100 light:text-gray-800 light:ring-gray-300">
            ML: Unknown
          </span>
        );
    }
  };

  const getAdminStatusBadge = (adminStatus: string) => {
    switch (adminStatus) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 ring-1 ring-inset ring-green-600/30 light:bg-green-100 light:text-green-800 light:ring-green-300">
            Admin: Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-300 ring-1 ring-inset ring-red-600/30 light:bg-red-100 light:text-red-800 light:ring-red-300">
            Admin: Rejected
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-300 ring-1 ring-inset ring-blue-600/30 light:bg-blue-100 light:text-blue-800 light:ring-blue-300">
            Admin: Assigned
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-600/20 text-yellow-300 ring-1 ring-inset ring-yellow-600/30 light:bg-yellow-100 light:text-yellow-800 light:ring-yellow-300">
            Admin: Pending
          </span>
        );
    }
  };

  const getPoliceStatusBadge = (policeStatus: string) => {
    switch (policeStatus) {
      case 'VIEWED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-300 ring-1 ring-inset ring-blue-600/30 light:bg-blue-100 light:text-blue-800 light:ring-blue-300">
            Police: Viewed
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-600/20 text-yellow-300 ring-1 ring-inset ring-yellow-600/30 light:bg-yellow-100 light:text-yellow-800 light:ring-yellow-300">
            Police: In Progress
          </span>
        );
      case 'ACTION_TAKEN':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 ring-1 ring-inset ring-green-600/30 light:bg-green-100 light:text-green-800 light:ring-green-300">
            Police: Action Taken
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 ring-1 ring-inset ring-green-600/30 light:bg-green-100 light:text-green-800 light:ring-green-300">
            Police: Resolved
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-300 ring-1 ring-inset ring-gray-600/30 light:bg-gray-100 light:text-gray-800 light:ring-gray-300">
            Police: Closed
          </span>
        );
      case 'NOT_VIEWED':
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-300 ring-1 ring-inset ring-gray-600/30 light:bg-gray-100 light:text-gray-800 light:ring-gray-300">
            Police: Not Viewed
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-300 ring-1 ring-inset ring-red-600/30 light:bg-red-100 light:text-red-800 light:ring-red-300">
            {priority.charAt(0) + priority.slice(1).toLowerCase()}
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-600/20 text-yellow-300 ring-1 ring-inset ring-yellow-600/30 light:bg-yellow-100 light:text-yellow-800 light:ring-yellow-300">
            Medium
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 ring-1 ring-inset ring-green-600/30 light:bg-green-100 light:text-green-800 light:ring-green-300">
            Low
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

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className={`rounded-xl border ${color} bg-gray-800 bg-opacity-60 p-4 shadow-lg transition-all duration-300 ease-in-out dark:bg-gray-800 dark:bg-opacity-60 light:border-gray-200 light:bg-white light:bg-opacity-80`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-sm text-gray-400 light:text-gray-600">{title}</p>
          {loading ? (
            <div className="h-6 w-16 animate-pulse rounded bg-gray-700 light:bg-gray-200"></div>
          ) : (
            <h3 className="text-xl font-bold text-gray-50 light:text-gray-800">{value}</h3>
          )}
        </div>
        <div className="text-2xl text-blue-400 light:text-blue-600">{icon}</div>
      </div>
    </motion.div>
  );

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
              color="border-blue-500"
            />
            <StatCard
              title="ML Accepted"
              value={stats.mlAccepted}
              icon="🤖"
              color="border-green-500"
            />
            <StatCard
              title="Admin Pending"
              value={stats.adminPending}
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

          {/* Additional Status Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <StatCard
              title="Admin Approved"
              value={stats.adminApproved}
              icon="✅"
              color="border-green-500"
            />
            <StatCard
              title="Admin Assigned"
              value={stats.adminAssigned}
              icon="👮"
              color="border-blue-500"
            />
            <StatCard
              title="Police In Progress"
              value={stats.policeInProgress}
              icon="🔄"
              color="border-yellow-500"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl transition-colors duration-300 dark:bg-gray-800 dark:bg-opacity-60 light:border-gray-300 light:bg-white light:bg-opacity-80 light:text-gray-900"
          >
            <div className="border-b border-gray-700 p-6 light:border-gray-200">
              {loading ? (
                <div className="h-8 w-48 animate-pulse rounded bg-gray-700 light:bg-gray-200"></div>
              ) : (
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-100 light:text-gray-800">
                  <span>📰</span> Recent Reports
                </h2>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-gray-300 light:text-gray-700">
                <thead>
                  <tr className="border-b border-gray-700 text-left text-gray-400 light:border-gray-200 light:text-gray-600">
                    <th className="p-4">ID</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">ML Status</th>
                    <th className="p-4">Admin Status</th>
                    <th className="p-4">Police Status</th>
                    <th className="p-4">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-gray-400 light:text-gray-600">
                        Loading reports...
                      </td>
                    </tr>
                  ) : recentReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-gray-400 light:text-gray-600">
                        No recent reports found.
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
                        <td className="p-4">{getAdminStatusBadge(report.adminStatus)}</td>
                        <td className="p-4">{getPoliceStatusBadge(report.policeStatus)}</td>
                        <td className="p-4">{getPriorityBadge(report.urgency)}</td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-gray-700 p-4 light:border-gray-200">
              {loading ? (
                <div className="h-6 w-32 animate-pulse rounded bg-gray-700 light:bg-gray-200"></div>
              ) : (
                <button
                  onClick={() => router.push('/admin/reports')}
                  className="flex items-center gap-2 text-blue-400 transition-colors hover:text-blue-300 light:text-blue-600 light:hover:text-blue-500"
                >
                  View All Reports <span>→</span>
                </button>
              )}
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
                {loading ? (
                  <div className="h-6 w-48 animate-pulse rounded bg-gray-700 light:bg-gray-200"></div>
                ) : (
                  <>
                    <span>📈</span> Status Overview
                  </>
                )}
              </div>
              <div className="h-64">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-gray-500 light:text-gray-400">Loading chart...</div>
                ) : (
                  <Bar
                    data={{
                      labels: ['ML Accepted', 'ML Pending', 'Admin Pending', 'Admin Approved', 'Police In Progress'],
                      datasets: [{
                        label: 'Reports',
                        data: [stats.mlAccepted, stats.mlPending, stats.adminPending, stats.adminApproved, stats.policeInProgress],
                        backgroundColor: ['#22c55e', '#eab308', '#f59e0b', '#10b981', '#3b82f6'],
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-6 light:bg-white light:bg-opacity-80 light:border-gray-300">
              <div className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-100 light:text-gray-800">
                {loading ? (
                  <div className="h-6 w-48 animate-pulse rounded bg-gray-700 light:bg-gray-200"></div>
                ) : (
                  <>
                    <span>📍</span> Crime Hotspots
                  </>
                )}
              </div>
              <div className="h-64 overflow-y-auto">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-gray-500 light:text-gray-400">Loading hotspots...</div>
                ) : hotspots.length === 0 ? (
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
                {loading ? (
                  <div className="h-6 w-48 animate-pulse rounded bg-gray-700 light:bg-gray-200"></div>
                ) : (
                  <>
                    <span>🔍</span> Top Crime Types
                  </>
                )}
              </div>
              <div className="h-64 overflow-y-auto">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-gray-500 light:text-gray-400">Loading crime types...</div>
                ) : crimeTypes.length === 0 ? (
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