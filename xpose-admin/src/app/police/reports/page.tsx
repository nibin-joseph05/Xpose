'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/police/Sidebar';
import PoliceHeader from '@/components/police/PoliceHeader';
import { Button } from '@/components/police/ui/button';

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

export default function PoliceReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<CrimeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState<UserData | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const theme = savedTheme === 'light' ? 'light' : 'dark';
    setTheme(theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, []);

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
        setError('Access denied: Only police officers can access this page');
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

        if (userData.role !== 'POLICE') {
          setError('Access denied: Only police officers can access this page');
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

        setUser(formattedUserData);
        localStorage.setItem('userData', JSON.stringify(formattedUserData));
      } catch (err: any) {
        setError('Failed to authenticate. Please log in again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        router.push('/police/login');
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchReports = async (retryCount = 0) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const params = new URLSearchParams({
          page: (currentPage - 1).toString(),
          size: itemsPerPage.toString(),
          officerId: user.id
        });

        if (user.stationId) {
          params.append('stationId', user.stationId);
        }

        const [springResponse, blockchainResponse] = await Promise.all([
          fetch(`${API_URL}/api/reports?${params.toString()}`, {
            signal: controller.signal,
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
          }),
          fetch(`${API_URL}/api/reports/chain`, {
            signal: controller.signal,
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
          }),
        ]);

        clearTimeout(timeoutId);

        if (!springResponse.ok || !blockchainResponse.ok) throw new Error('Failed to fetch reports');

        const [springData, blockchainData] = await Promise.all([
          springResponse.json(),
          blockchainResponse.json(),
        ]);

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

        setReports(mergedReports);
        setTotalPages(springData.totalPages || 1);
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

    setLoading(true);
    fetchReports();
  }, [user, currentPage]);

  const updateStatus = async (reportId: string, newStatus: string) => {
    if (!user?.id) return;

    try {
      setUpdatingStatus(reportId);
      const response = await fetch(`${API_URL}/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          updatedByOfficerId: parseInt(user.id),
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setReports(prev =>
        prev.map(report =>
          report.reportId === reportId
            ? { ...report, status: newStatus as any }
            : report
        )
      );

      alert(`Status updated to ${newStatus.replace('RECEIVED_', '')}`);
    } catch (err: any) {
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

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

  const StatusDropdown = ({ report }: { report: CrimeReport }) => (
    <select
      value={report.status}
      onChange={(e) => updateStatus(report.reportId, e.target.value)}
      disabled={updatingStatus === report.reportId}
      className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-[#C3B091] light:border-gray-300 light:bg-white light:text-gray-900"
    >
      <option value="RECEIVED_PENDING_REVIEW">Pending Review</option>
      <option value="RECEIVED_HIGH_PRIORITY">High Priority</option>
      <option value="RECEIVED_MEDIUM_PRIORITY">Medium Priority</option>
      <option value="RECEIVED_STANDARD">Standard</option>
      <option value="ACCEPTED">Accepted</option>
      <option value="REJECTED">Rejected</option>
    </select>
  );

  const normalizeString = (str: string) => {
    return str.toLowerCase().replace(/\s+/g, '');
  };

  const filteredReports = useMemo(() => {
    const normalizedQuery = normalizeString(searchQuery);
    return reports.filter(
      (report) =>
        normalizeString(report.reportId).includes(normalizedQuery) ||
        normalizeString(report.crimeType).includes(normalizedQuery) ||
        normalizeString(report.description).includes(normalizedQuery) ||
        normalizeString(report.translatedDescription).includes(normalizedQuery)
    );
  }, [reports, searchQuery]);

  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredReports.slice(startIndex, endIndex);
  }, [filteredReports, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewReport = (reportId: string) => {
    router.push(`/police/reports/${reportId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C3B091] to-[#8B7B5A] text-white transition-colors duration-500 dark:from-[#C3B091] dark:to-[#8B7B5A] light:from-[#E6D4A8] light:to-[#A69875]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-20">
        <div className="particle-layer pointer-events-none"></div>
        <div className="shimmer-layer pointer-events-none"></div>
      </div>

      <Sidebar />

      <main className="ml-0 p-4 transition-all duration-300 md:ml-[80px] md:p-8 lg:ml-[260px]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl">
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
            transition={{ delay: 0.2 }}
            className="mb-12 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl transition-all duration-300 dark:bg-gray-800 dark:bg-opacity-60 light:border-gray-300 light:bg-white light:bg-opacity-80"
          >
            <div className="border-b border-gray-700 p-6 flex justify-between items-center flex-wrap gap-4 light:border-gray-200">
              <h3 className="text-xl font-bold text-[#C3B091] light:text-[#8B7B5A]">Assigned Reports</h3>
              <input
                type="text"
                placeholder="Search reports by ID, crime type, or description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-grow max-w-sm bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C3B091] light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-gray-300 light:text-gray-700">
                <thead className="sticky top-0 bg-gray-800 bg-opacity-70 backdrop-blur-sm border-b border-gray-700 text-gray-400 light:bg-white light:bg-opacity-80 light:border-gray-200 light:text-gray-600 z-10">
                  <tr>
                    <th className="p-4">Report ID</th>
                    <th className="p-4">Crime Type</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Submitted At</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-gray-400 light:text-gray-600">
                        Loading reports...
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-gray-400 light:text-gray-600">
                        {user ? `No reports assigned to officer ID ${user.id}` : 'No reports found'}
                      </td>
                    </tr>
                  ) : (
                    paginatedReports.map((report) => (
                      <motion.tr
                        key={report.reportId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-gray-800 hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200 light:border-gray-200 light:hover:bg-gray-100"
                      >
                        <td className="p-4 font-medium text-[#C3B091] light:text-[#8B7B5A]">{report.reportId}</td>
                        <td className="p-4 text-gray-400 light:text-gray-700">{report.crimeType} (ID: {report.crimeTypeId})</td>
                        <td className="p-4 text-gray-400 light:text-gray-700">{report.address}, {report.city}, {report.state}</td>
                        <td className="p-4">
                          <StatusDropdown report={report} />
                        </td>
                        <td className="p-4">{getPriorityBadge(report.urgency)}</td>
                        <td className="p-4 text-gray-400 light:text-gray-700">{new Date(report.submittedAt).toLocaleString()}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleViewReport(report.reportId)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[#C3B091] hover:bg-[#C3B091]/20 hover:text-[#8B7B5A] transition-colors duration-200 light:text-[#8B7B5A] light:hover:bg-[#C3B091]/10"
                            title="View Report Details"
                          >
                            👁️
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 flex justify-center items-center space-x-2 border-t border-gray-700 light:border-gray-200">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white disabled:opacity-50 light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? 'bg-[#C3B091] text-white shadow-md'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700'
                    }`}
                  >
                    {page}
                  </Button>
                ))}
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
          0% { transform: translate(0, 0); opacity: 0.2; }
          50% { transform: translate(5%, 5%); opacity: 0.3; }
          100% { transform: translate(0, 0); opacity: 0.2; }
        }

        @keyframes shimmer-background {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
      `}</style>
    </div>
  );
}