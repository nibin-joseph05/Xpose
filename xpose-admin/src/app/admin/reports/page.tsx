'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/admin/ui/button';

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
  rejectionReason?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.220.2:8080';

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<CrimeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState<CrimeReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectMode, setIsRejectMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme === 'light' ? 'light' : 'dark');
    } else {
      setTheme('dark');
    }
    fetchReports();
  }, [currentPage]);

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
      const springResponse = await fetch(`${API_URL}/api/reports?page=${currentPage - 1}&size=${itemsPerPage}`);
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
          rejectionReason: springReport.rejectionReason,
        };
        return report;
      });

      setReports(mergedReports);
      setTotalPages(springData.totalPages);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReport = async () => {
    if (!selectedReport) return;

    try {
      const response = await fetch(`${API_URL}/api/reports/update-admin-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: selectedReport.reportId,
          adminStatus: 'APPROVED',
          reviewedById: 1,
          rejectionReason: null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to approve report: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('Report approved successfully!');
        setIsModalOpen(false);
        setSelectedReport(null);
        setStatusMessage('');
        setRejectionReason('');
        setIsRejectMode(false);
        await fetchReports();
      } else {
        throw new Error(result.message || 'Failed to approve report');
      }
    } catch (err: any) {
      console.error('Error approving report:', err);
      setError(err.message || 'Failed to approve report');
    }
  };

  const handleRejectReport = async () => {
    if (!selectedReport) return;

    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/reports/update-admin-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: selectedReport.reportId,
          adminStatus: 'REJECTED',
          reviewedById: 1,
          rejectionReason: rejectionReason.trim(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to reject report: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('Report rejected successfully!');
        setIsModalOpen(false);
        setSelectedReport(null);
        setStatusMessage('');
        setRejectionReason('');
        setIsRejectMode(false);
        await fetchReports();
      } else {
        throw new Error(result.message || 'Failed to reject report');
      }
    } catch (err: any) {
      console.error('Error rejecting report:', err);
      setError(err.message || 'Failed to reject report');
    }
  };

  const handleOpenStatusModal = (report: CrimeReport) => {
    setSelectedReport(report);
    setRejectionReason('');
    setIsRejectMode(false);

    if (report.adminStatus === 'APPROVED') {
      setStatusMessage('This report is already approved.');
    } else if (report.adminStatus === 'REJECTED') {
      setStatusMessage('This report has been rejected and cannot be changed.');
    } else if (report.status !== 'ACCEPTED') {
      setStatusMessage('This report needs ML approval before it can be processed.');
    } else if (!report.assignedOfficerId) {
      setStatusMessage('Please assign an officer first to process this report.');
    } else {
      setStatusMessage('This report is ready for review.');
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
    setStatusMessage('');
    setRejectionReason('');
    setIsRejectMode(false);
  };

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
    router.push(`/admin/reports/${reportId}`);
  };

  const canProcessReport = (report: CrimeReport) => {
    return (report.adminStatus === 'PENDING' || report.adminStatus === 'ASSIGNED') &&
           report.status === 'ACCEPTED' &&
           report.assignedOfficerId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-indigo-950 text-white transition-colors duration-500 dark:from-gray-950 dark:to-indigo-950 light:from-blue-50 light:to-purple-50 light:text-gray-900">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-20">
        <div className="particle-layer"></div>
        <div className="shimmer-layer"></div>
      </div>

      <Sidebar />

      <main className="ml-0 p-4 transition-all duration-300 md:ml-[80px] md:p-8 lg:ml-[260px]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl">
          <AdminHeader title="Crime Reports" />

          <div className="pt-8 flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-blue-400 light:text-blue-700">Crime Reports</h2>
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

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-900 text-green-200 p-4 rounded-lg border border-green-700 mb-6 font-medium light:bg-green-100 light:text-green-700 light:border-green-300"
            >
              {successMessage}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl dark:hover:border-blue-600 transition-all duration-300 light:border-gray-300 light:bg-white light:bg-opacity-80 light:hover:border-blue-500"
          >
            <div className="border-b border-gray-700 p-6 flex justify-between items-center flex-wrap gap-4 light:border-gray-300">
              <h3 className="text-xl font-bold text-blue-300 light:text-blue-700">All Reports</h3>
              <input
                type="text"
                placeholder="Search reports by ID, crime type, or description..."
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
                      <td colSpan={9} className="p-4 text-center text-gray-400 light:text-gray-600">
                        Loading reports...
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-gray-400 light:text-gray-600">
                        No reports found matching your search.
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
                        <td className="p-4 font-medium text-blue-200 light:text-gray-800">{report.reportId}</td>
                        <td className="p-4 text-gray-400 light:text-gray-700">{report.crimeType} (ID: {report.crimeTypeId})</td>
                        <td className="p-4 text-gray-400 light:text-gray-700">{report.address}, {report.city}, {report.state}</td>
                        <td className="p-4">{getStatusBadge(report.status)}</td>
                        <td className="p-4">{getAdminStatusBadge(report.adminStatus)}</td>
                        <td className="p-4">{getPoliceStatusBadge(report.policeStatus)}</td>
                        <td className="p-4">{getPriorityBadge(report.urgency)}</td>
                        <td className="p-4 text-gray-400 light:text-gray-700">{new Date(report.submittedAt).toLocaleString()}</td>
                        <td className="p-4 text-center space-x-2">
                          <button
                            onClick={() => handleOpenStatusModal(report)}
                            disabled={!canProcessReport(report) && report.adminStatus !== 'APPROVED' && report.adminStatus !== 'REJECTED'}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 ${
                              canProcessReport(report)
                                ? 'text-blue-400 hover:bg-blue-800/50 hover:text-blue-300 light:text-blue-600 light:hover:bg-blue-100 light:hover:text-blue-800'
                                : report.adminStatus === 'APPROVED'
                                ? 'text-green-400 cursor-not-allowed light:text-green-500'
                                : report.adminStatus === 'REJECTED'
                                ? 'text-red-400 cursor-not-allowed light:text-red-500'
                                : 'text-yellow-400 hover:bg-yellow-800/50 hover:text-yellow-300 light:text-yellow-600 light:hover:bg-yellow-100 light:hover:text-yellow-800'
                            }`}
                            title={
                              canProcessReport(report)
                                ? "Review Report"
                                : report.adminStatus === 'APPROVED'
                                ? "Already Approved"
                                : report.adminStatus === 'REJECTED'
                                ? "Already Rejected"
                                : "Cannot process at this time"
                            }
                          >
                            {canProcessReport(report) ? '📋' : report.adminStatus === 'APPROVED' ? '✅' : report.adminStatus === 'REJECTED' ? '❌' : '⏳'}
                          </button>
                          <button
                            onClick={() => handleViewReport(report.reportId)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-blue-400 hover:bg-blue-800/50 hover:text-blue-300 transition-colors duration-200 light:text-blue-600 light:hover:bg-blue-100 light:hover:text-blue-800"
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
              <div className="p-4 flex justify-center items-center space-x-2 border-t border-gray-700 light:border-gray-300">
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
                        ? 'bg-blue-600 text-white shadow-md'
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

          {/* Status Update Modal */}
          {isModalOpen && selectedReport && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 light:bg-white light:border-gray-300"
              >
                <h3 className="text-lg font-bold text-blue-300 light:text-blue-700 mb-4">
                  Manage Report: {selectedReport.reportId}
                </h3>

                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4 light:bg-gray-100">
                    <h4 className="text-md font-semibold text-blue-300 light:text-blue-700 mb-2">Current Status</h4>
                    <p className="text-gray-300 light:text-gray-700">
                      <strong>ML Status:</strong> {selectedReport.status}
                    </p>
                    <p className="text-gray-300 light:text-gray-700">
                      <strong>Admin Status:</strong> {selectedReport.adminStatus}
                    </p>
                    <p className="text-gray-300 light:text-gray-700">
                      <strong>Police Status:</strong> {selectedReport.policeStatus}
                    </p>
                    <p className="text-gray-300 light:text-gray-700">
                      <strong>Assigned Officer:</strong> {selectedReport.assignedOfficerId ? `ID: ${selectedReport.assignedOfficerId}` : 'Not assigned'}
                    </p>
                  </div>

                  {statusMessage && (
                    <div className={`p-3 rounded-lg ${
                      statusMessage.includes('approved')
                        ? 'bg-green-900/30 text-green-300 border border-green-700 light:bg-green-100 light:text-green-700'
                        : statusMessage.includes('rejected')
                        ? 'bg-red-900/30 text-red-300 border border-red-700 light:bg-red-100 light:text-red-700'
                        : 'bg-yellow-900/30 text-yellow-300 border border-yellow-700 light:bg-yellow-100 light:text-yellow-700'
                    }`}>
                      {statusMessage}
                    </div>
                  )}

                  {canProcessReport(selectedReport) && !isRejectMode && (
                    <div className="space-y-3">
                      <p className="text-blue-300 light:text-blue-600 font-medium">
                        This report is ready for review. Choose an action:
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleApproveReport}
                          className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white light:from-green-400 light:to-teal-500 light:hover:from-green-500 light:hover:to-teal-600"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => setIsRejectMode(true)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white light:from-red-400 light:to-pink-500 light:hover:from-red-500 light:hover:to-pink-600"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  {isRejectMode && (
                    <div className="space-y-3">
                      <p className="text-red-300 light:text-red-600 font-medium">
                        Please provide a reason for rejecting this report:
                      </p>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter rejection reason..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleRejectReport}
                          disabled={!rejectionReason.trim()}
                          className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white disabled:opacity-50 light:from-red-400 light:to-pink-500 light:hover:from-red-500 light:hover:to-pink-600"
                        >
                          Confirm Reject
                        </Button>
                        <Button
                          onClick={() => setIsRejectMode(false)}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {!selectedReport.assignedOfficerId && selectedReport.status === 'ACCEPTED' && (
                    <div className="text-center">
                      <p className="text-yellow-300 light:text-yellow-600 mb-3">
                        This report needs to be assigned to an officer before it can be processed.
                      </p>
                      <Button
                        onClick={() => {
                          handleCloseModal();
                          router.push('/admin/assign-report');
                        }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white light:from-blue-400 light:to-purple-500 light:hover:from-blue-500 light:hover:to-purple-600"
                      >
                        Go to Assign Reports
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    onClick={handleCloseModal}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
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