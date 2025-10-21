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
  policeFeedback?: string;
  policeActionProof?: string[];
  actionTakenAt?: string;
  actionTakenBy?: number;
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
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CrimeReport | null>(null);
  const [actionFeedback, setActionFeedback] = useState('');
  const [actionFiles, setActionFiles] = useState<File[]>([]);

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

        const springResponse = await fetch(`${API_URL}/api/reports?${params.toString()}`, {
          signal: controller.signal,
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        });

        clearTimeout(timeoutId);

        if (!springResponse.ok) throw new Error('Failed to fetch reports');

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
            policeFeedback: springReport.policeFeedback,
            policeActionProof: springReport.policeActionProof,
            actionTakenAt: springReport.actionTakenAt,
            actionTakenBy: springReport.actionTakenBy,
          };
        });

        const approvedReports = mergedReports.filter(report =>
          report.adminStatus === 'APPROVED' || report.adminStatus === 'ASSIGNED'
        );

        setReports(approvedReports);
        setTotalPages(Math.ceil(approvedReports.length / itemsPerPage) || 1);
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

  const canChangePoliceStatus = (report: CrimeReport, newStatus: string) => {
    if (report.adminStatus !== 'APPROVED' && report.adminStatus !== 'ASSIGNED') {
      return false;
    }

    const statusFlow = {
      'NOT_VIEWED': ['VIEWED'],
      'VIEWED': ['IN_PROGRESS', 'NOT_VIEWED'],
      'IN_PROGRESS': ['ACTION_TAKEN', 'VIEWED'],
      'ACTION_TAKEN': ['RESOLVED', 'IN_PROGRESS'],
      'RESOLVED': ['CLOSED', 'ACTION_TAKEN'],
      'CLOSED': []
    };

    return statusFlow[report.policeStatus]?.includes(newStatus) || false;
  };

  const updatePoliceStatus = async (reportId: string, newPoliceStatus: string, feedback?: string) => {
      if (!user?.id) return;

      try {
          setUpdatingStatus(reportId);

          const requestBody = {
              reportId: reportId,
              policeStatus: newPoliceStatus,
              officerId: parseInt(user.id),
              feedback: feedback || '',
              actionProof: ''
          };

          const response = await fetch(`${API_URL}/api/reports/update-police-status`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              },
              body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Failed to update police status: ${errorText}`);
          }

          const result = await response.json();

          if (result.success) {
              setReports(prev =>
                  prev.map(report =>
                      report.reportId === reportId
                          ? {
                              ...report,
                              policeStatus: newPoliceStatus as any,
                              policeFeedback: feedback || '',
                              actionTakenAt: result.actionTakenAt || new Date().toISOString()
                          }
                          : report
                  )
              );

              setShowActionModal(false);
              setSelectedReport(null);
              setActionFeedback('');
              setActionFiles([]);

              alert(`Status updated to ${newPoliceStatus}`);
          } else {
              throw new Error(result.message || 'Failed to update police status');
          }
      } catch (err: any) {
          alert('Failed to update police status: ' + err.message);
      } finally {
          setUpdatingStatus(null);
      }
  };

  const uploadPoliceProof = async (reportId: string, files: File[]) => {
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('reportId', reportId);

        const response = await fetch(`${API_URL}/api/reports/upload-police-proof`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload file: ${file.name}`);
        }
      }
      return true;
    } catch (err: any) {
      console.error('Error uploading police proof:', err);
      return false;
    }
  };

  const handleStatusChange = (report: CrimeReport, newStatus: string) => {
    if (!canChangePoliceStatus(report, newStatus)) {
      alert('Invalid status transition or report not approved by admin.');
      return;
    }

    if (newStatus === 'ACTION_TAKEN' || newStatus === 'RESOLVED') {
      setSelectedReport({...report, policeStatus: newStatus as any});
      setShowActionModal(true);
    } else {
      updatePoliceStatus(report.reportId, newStatus);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setActionFiles(Array.from(e.target.files));
    }
  };

  const submitActionWithFiles = async () => {
    if (!selectedReport) return;

    if (selectedReport.policeStatus === 'RESOLVED' && actionFiles.length === 0) {
      alert('Please upload evidence files when resolving a report.');
      return;
    }

    if (!actionFeedback.trim()) {
      alert('Please provide feedback about the action taken.');
      return;
    }

    try {
      setUpdatingStatus(selectedReport.reportId);

      await updatePoliceStatus(selectedReport.reportId, selectedReport.policeStatus, actionFeedback);

      if (actionFiles.length > 0) {
        const uploadSuccess = await uploadPoliceProof(selectedReport.reportId, actionFiles);
        if (!uploadSuccess) {
          alert('Status updated but some files failed to upload.');
        }
      }

    } catch (err: any) {
      alert('Failed to complete action: ' + err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 ring-1 ring-inset ring-green-600/30 light:bg-green-100 light:text-green-800 light:ring-green-300">ML: Accepted</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-300 ring-1 ring-inset ring-red-600/30 light:bg-red-100 light:text-red-800 light:ring-red-300">ML: Rejected</span>;
      case 'PENDING_REVIEW':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-600/20 text-yellow-300 ring-1 ring-inset ring-yellow-600/30 light:bg-yellow-100 light:text-yellow-800 light:ring-yellow-300">ML: Pending Review</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-300 ring-1 ring-inset ring-gray-600/30 light:bg-gray-100 light:text-gray-800 light:ring-gray-300">ML: Unknown</span>;
    }
  };

  const getAdminStatusBadge = (adminStatus: string) => {
    switch (adminStatus) {
      case 'APPROVED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 ring-1 ring-inset ring-green-600/30 light:bg-green-100 light:text-green-800 light:ring-green-300">Admin: Approved</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-300 ring-1 ring-inset ring-red-600/30 light:bg-red-100 light:text-red-800 light:ring-red-300">Admin: Rejected</span>;
      case 'ASSIGNED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-300 ring-1 ring-inset ring-blue-600/30 light:bg-blue-100 light:text-blue-800 light:ring-blue-300">Admin: Assigned</span>;
      case 'PENDING':
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-600/20 text-yellow-300 ring-1 ring-inset ring-yellow-600/30 light:bg-yellow-100 light:text-yellow-800 light:ring-yellow-300">Admin: Pending</span>;
    }
  };

  const getPoliceStatusBadge = (policeStatus: string) => {
    switch (policeStatus) {
      case 'VIEWED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-300 ring-1 ring-inset ring-blue-600/30 light:bg-blue-100 light:text-blue-800 light:ring-blue-300">Police: Viewed</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-600/20 text-yellow-300 ring-1 ring-inset ring-yellow-600/30 light:bg-yellow-100 light:text-yellow-800 light:ring-yellow-300">Police: In Progress</span>;
      case 'ACTION_TAKEN':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 ring-1 ring-inset ring-green-600/30 light:bg-green-100 light:text-green-800 light:ring-green-300">Police: Action Taken</span>;
      case 'RESOLVED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 ring-1 ring-inset ring-green-600/30 light:bg-green-100 light:text-green-800 light:ring-green-300">Police: Resolved</span>;
      case 'CLOSED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-300 ring-1 ring-inset ring-gray-600/30 light:bg-gray-100 light:text-gray-800 light:ring-gray-300">Police: Closed</span>;
      case 'NOT_VIEWED':
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-300 ring-1 ring-inset ring-gray-600/30 light:bg-gray-100 light:text-gray-800 light:ring-gray-300">Police: Not Viewed</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'CRITICAL':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-300 ring-1 ring-inset ring-red-600/30 light:bg-red-100 light:text-red-800 light:ring-red-300">{priority.charAt(0) + priority.slice(1).toLowerCase()}</span>;
      case 'MEDIUM':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-600/20 text-yellow-300 ring-1 ring-inset ring-yellow-600/30 light:bg-yellow-100 light:text-yellow-800 light:ring-yellow-300">Medium</span>;
      case 'LOW':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 ring-1 ring-inset ring-green-600/30 light:bg-green-100 light:text-green-800 light:ring-green-300">Low</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-300 ring-1 ring-inset ring-gray-600/30 light:bg-gray-100 light:text-gray-800 light:ring-gray-300">Unknown</span>;
    }
  };

  const StatusDropdown = ({ report }: { report: CrimeReport }) => {
    const isDisabled = report.adminStatus !== 'APPROVED' && report.adminStatus !== 'ASSIGNED';

    return (
      <select
        value={report.policeStatus}
        onChange={(e) => handleStatusChange(report, e.target.value)}
        disabled={updatingStatus === report.reportId || isDisabled}
        className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-[#C3B091] light:border-gray-300 light:bg-white light:text-gray-900 disabled:opacity-50"
      >
        <option value="NOT_VIEWED">Not Viewed</option>
        <option value="VIEWED">Viewed</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="ACTION_TAKEN">Action Taken</option>
        <option value="RESOLVED">Resolved</option>
        <option value="CLOSED">Closed</option>
      </select>
    );
  };

  const normalizeString = (str: string) => {
    return str.toLowerCase().replace(/\s+/g, '');
  };

  const filteredReports = useMemo(() => {
    const normalizedQuery = normalizeString(searchQuery);
    return reports.filter(
      (report) =>
        normalizeString(report.reportId).includes(normalizedQuery) ||
        normalizeString(report.crimeType).includes(normalizedQuery) ||
        normalizeString(report.originalDescription).includes(normalizedQuery) ||
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
                    <th className="p-4">ML Status</th>
                    <th className="p-4">Admin Status</th>
                    <th className="p-4">Police Status</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Submitted At</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-gray-400 light:text-gray-600">Loading reports...</td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-gray-400 light:text-gray-600">{user ? `No approved reports assigned to officer ID ${user.id}` : 'No reports found'}</td>
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
                        <td className="p-4">{getStatusBadge(report.status)}</td>
                        <td className="p-4">{getAdminStatusBadge(report.adminStatus)}</td>
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
                    className={`px-3 py-1 rounded ${currentPage === page ? 'bg-[#C3B091] text-white shadow-md' : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700'}`}
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

      {showActionModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 max-w-full mx-4 light:bg-white light:text-gray-900">
            <h3 className="text-lg font-bold mb-4">
              {selectedReport.policeStatus === 'ACTION_TAKEN' ? 'Action Taken Details' : 'Resolve Report'}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Feedback *</label>
              <textarea
                value={actionFeedback}
                onChange={(e) => setActionFeedback(e.target.value)}
                placeholder={selectedReport.policeStatus === 'ACTION_TAKEN' ? "Describe the action taken..." : "Describe how the issue was resolved..."}
                className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white mb-4 light:bg-gray-100 light:border-gray-300 light:text-gray-900"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Upload Evidence {selectedReport.policeStatus === 'RESOLVED' && '*'}
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white light:bg-gray-100 light:border-gray-300 light:text-gray-900"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <p className="text-xs text-gray-400 mt-1 light:text-gray-600">
                Supported formats: PDF, JPG, PNG, DOC (Max 10MB per file)
                {selectedReport.policeStatus === 'RESOLVED' && ' - Required for resolution'}
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedReport(null);
                  setActionFeedback('');
                  setActionFiles([]);
                }}
                className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 text-white light:bg-gray-300 light:hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={submitActionWithFiles}
                disabled={updatingStatus === selectedReport.reportId || !actionFeedback.trim() || (selectedReport.policeStatus === 'RESOLVED' && actionFiles.length === 0)}
                className="px-4 py-2 bg-[#C3B091] rounded-lg hover:bg-[#8B7B5A] text-white disabled:opacity-50 light:bg-[#8B7B5A] light:hover:bg-[#7A6A49]"
              >
                {updatingStatus === selectedReport.reportId ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

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