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
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  submittedAt: string;
  assignedOfficerId?: number;
  latitude?: number;
  longitude?: number;
  reviewedAt?: string;
  reviewedById?: number;
  rejectionReason?: string;
}

interface PoliceStation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface Authority {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  stationId: number;
  stationName: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.220.2:8080';

export default function AssignReportPage() {
  const router = useRouter();
  const [reports, setReports] = useState<CrimeReport[]>([]);
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [officers, setOfficers] = useState<Authority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState<CrimeReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState<number | null>(null);
  const [newReviewStatus, setNewReviewStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme === 'light' ? 'light' : 'dark');
    } else {
      setTheme('dark');
    }
    fetchData();
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const springResponse = await fetch(`${API_URL}/api/reports?page=${currentPage - 1}&size=${itemsPerPage}`);
      if (!springResponse.ok) throw new Error('Failed to fetch reports');
      const springData = await springResponse.json();
      console.log('Spring API Response:', springData);

      const blockchainResponse = await fetch(`${API_URL}/api/reports/chain`);
      if (!blockchainResponse.ok) throw new Error('Failed to fetch blockchain chain');
      const blockchainData = await blockchainResponse.json();
      console.log('Blockchain API Response:', blockchainData);

      const mergedReports: CrimeReport[] = springData.reports.map((springReport: any) => {
        const blockchainReport = blockchainData.find((block: any) => block.data?.reportId === springReport.reportId);
        const report = {
          reportId: springReport.reportId,
          crimeTypeId: springReport.crimeTypeId,
          crimeType: springReport.crimeType,
          categoryId: springReport.categoryId,
          categoryName: springReport.categoryName,
          originalDescription: blockchainReport ? blockchainReport.data.description : springReport.originalDescription,
          translatedDescription: blockchainReport ? blockchainReport.data.translatedText : springReport.translatedDescription,
          address: blockchainReport ? blockchainReport.data.address : springReport.address,
          city: blockchainReport ? blockchainReport.data.city : springReport.city,
          state: blockchainReport ? blockchainReport.data.state : springReport.state,
          policeStation: springReport.policeStation,
          status: springReport.status,
          reviewStatus: springReport.reviewStatus || 'PENDING',
          urgency: springReport.urgency,
          submittedAt: blockchainReport ? blockchainReport.data.submittedAt : springReport.submittedAt,
          assignedOfficerId: springReport.assignedOfficerId,
          latitude: blockchainReport ? blockchainReport.data.latitude : springReport.latitude,
          longitude: blockchainReport ? blockchainReport.data.longitude : springReport.longitude,
          reviewedAt: springReport.reviewedAt,
          reviewedById: springReport.reviewedById,
          rejectionReason: springReport.rejectionReason,
        };
        console.log('Merged Report:', report);
        return report;
      });

      setReports(mergedReports);
      setTotalPages(springData.totalPages);

      const stationsResponse = await fetch(`${API_URL}/api/police-stations/all`);
      if (!stationsResponse.ok) throw new Error('Failed to fetch police stations');
      const stationsData = await stationsResponse.json();
      setStations(Array.isArray(stationsData) ? stationsData : []);

      const officersResponse = await fetch(`${API_URL}/api/authority/police`);
      if (!officersResponse.ok) throw new Error('Failed to fetch police officers');
      const officersData = await officersResponse.json();
      const formattedOfficers = officersData.map((officer: any) => ({
        ...officer,
        stationName: officer.station ? officer.station.name : 'Unassigned',
        stationId: officer.station ? officer.station.id : null,
      }));
      setOfficers(Array.isArray(formattedOfficers) ? formattedOfficers : []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getNearbyOfficers = (report: CrimeReport) => {
    const reportStation = stations.find((s) => s.name === report.policeStation);
    if (!reportStation) return officers;
    return officers.filter((o) => o.stationId === reportStation.id);
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport || !newReviewStatus) return;

    try {
      if (newReviewStatus === 'ASSIGNED') {
        if (!selectedOfficerId) {
          throw new Error('Officer must be selected for ASSIGNED status');
        }
        const response = await fetch(`${API_URL}/api/reports/assign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportId: selectedReport.reportId,
            officerId: selectedOfficerId,
            reviewStatus: 'ASSIGNED',
            reviewedById: 1,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to assign report');
        }
      } else {
        const response = await fetch(`${API_URL}/api/reports/update-review-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportId: selectedReport.reportId,
            reviewStatus: newReviewStatus,
            reviewedById: 1,
            rejectionReason: newReviewStatus === 'REJECTED' ? rejectionReason : null,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to update report status to ${newReviewStatus}`);
        }
      }

      setSuccessMessage(`Report status updated successfully to ${newReviewStatus}!`);
      setIsModalOpen(false);
      setSelectedReport(null);
      setSelectedOfficerId(null);
      setNewReviewStatus(null);
      setRejectionReason('');
      await fetchData();
    } catch (err: any) {
      console.error('Error updating report status:', err);
      setError(err.message || 'Failed to update report status');
    }
  };

  const handleAutoAssignReport = async (report: CrimeReport) => {
    if (!report.latitude || !report.longitude) {
      setError('Cannot auto-assign: Report location (latitude/longitude) not available');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/reports/auto-assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: report.reportId,
          reviewStatus: 'ASSIGNED',
          reviewedById: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to auto-assign report');
      }

      const result = await response.json();
      setSuccessMessage(`Report auto-assigned successfully to officer ID ${result.officerId}!`);
      await fetchData();
    } catch (err: any) {
      console.error('Error auto-assigning report:', err);
      setError(err.message || 'Failed to auto-assign report');
    }
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

  const getReviewStatusBadge = (reviewStatus: string) => {
    switch (reviewStatus) {
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
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-600/20 text-purple-300 ring-1 ring-inset ring-purple-600/30 light:bg-purple-100 light:text-purple-800 light:ring-purple-300">
            Admin: In Progress
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-600/20 text-teal-300 ring-1 ring-inset ring-teal-600/30 light:bg-teal-100 light:text-teal-800 light:ring-teal-300">
            Admin: Resolved
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

  const handleOpenManageModal = (report: CrimeReport) => {
    setSelectedReport(report);
    setNewReviewStatus(report.reviewStatus as any);
    setSelectedOfficerId(report.assignedOfficerId || null);
    setRejectionReason(report.rejectionReason || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
    setSelectedOfficerId(null);
    setNewReviewStatus(null);
    setRejectionReason('');
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
          <AdminHeader title="Assign Reports" />

          <div className="pt-8 flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-blue-400 light:text-blue-700">Assign Crime Reports</h2>
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
                    <th className="p-4">Priority</th>
                    <th className="p-4">Assigned Officer</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-gray-400 light:text-gray-600">
                        Loading reports...
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-gray-400 light:text-gray-600">
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
                        <td className="p-4">{getReviewStatusBadge(report.reviewStatus)}</td>
                        <td className="p-4">{getPriorityBadge(report.urgency)}</td>
                        <td className="p-4 text-gray-400 light:text-gray-700">
                          {report.assignedOfficerId
                            ? officers.find((o) => o.id === report.assignedOfficerId)?.name || 'Unknown'
                            : 'Unassigned'}
                        </td>
                        <td className="p-4 text-center space-x-2">
                          <button
                            onClick={() => handleOpenManageModal(report)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-blue-400 hover:bg-blue-800/50 hover:text-blue-300 transition-colors duration-200 light:text-blue-600 light:hover:bg-blue-100 light:hover:text-blue-800"
                            title="Manage Status"
                          >
                            ⚙️
                          </button>
                          <button
                            onClick={() => handleAutoAssignReport(report)}
                            disabled={report.reviewStatus === 'REJECTED' || report.assignedOfficerId !== undefined || !report.latitude || !report.longitude}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-green-400 hover:bg-green-800/50 hover:text-green-300 transition-colors duration-200 light:text-green-600 light:hover:bg-green-100 light:hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Auto-Assign Report"
                          >
                            🚓
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
                  Manage Status for Report: {selectedReport.reportId}
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 light:text-gray-600">Current Status: {selectedReport.reviewStatus}</label>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 light:text-gray-600">New Status</label>
                  <select
                    value={newReviewStatus || ''}
                    onChange={(e) => setNewReviewStatus(e.target.value as any)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 light:bg-gray-100 light:border-gray-300 light:text-gray-900"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
                {newReviewStatus === 'ASSIGNED' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 light:text-gray-600">Select Officer</label>
                    <select
                      value={selectedOfficerId || ''}
                      onChange={(e) => setSelectedOfficerId(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 light:bg-gray-100 light:border-gray-300 light:text-gray-900"
                    >
                      <option value="" disabled>Select an officer</option>
                      {getNearbyOfficers(selectedReport).map((officer) => (
                        <option key={officer.id} value={officer.id}>
                          {officer.name} ({officer.stationName})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {newReviewStatus === 'REJECTED' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 light:text-gray-600">Rejection Reason</label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
                      placeholder="Enter rejection reason"
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={handleCloseModal}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={(newReviewStatus === 'ASSIGNED' && !selectedOfficerId) || (newReviewStatus === 'REJECTED' && !rejectionReason)}
                    className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white disabled:opacity-50 light:from-green-400 light:to-teal-500 light:hover:from-green-500 light:hover:to-teal-600"
                  >
                    Update Status
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