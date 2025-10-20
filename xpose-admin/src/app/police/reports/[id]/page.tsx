'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/police/Sidebar';
import PoliceHeader from '@/components/police/PoliceHeader';
import { Button } from '@/components/police/ui/button';

interface CrimeReportDetail {
  reportId: string;
  crimeType: string;
  crimeTypeId: number | null;
  categoryId: number | null;
  categoryName: string | null;
  originalDescription: string;
  processedDescription: string;
  address: string;
  city: string;
  state: string;
  policeStation: string;
  status: 'ACCEPTED' | 'REJECTED' | 'PENDING_REVIEW';
  adminStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ASSIGNED';
  policeStatus: 'NOT_VIEWED' | 'VIEWED' | 'IN_PROGRESS' | 'ACTION_TAKEN' | 'RESOLVED' | 'CLOSED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  submittedAt: string;
  confidenceScore: number | null;
  spamScore: number | null;
  toxicityScores: Record<string, any> | null;
  shapExplanation: Record<string, any> | null;
  reportQuality: string | null;
  blockchainHash: string | null;
  blockchainTimestamp: string | null;
  blockchainTxId: string | null;
  rawBlockchainData: string | null;
  assignedOfficerId?: number;
  policeFeedback?: string;
  policeActionProof?: string[];
  actionTakenAt?: string;
  actionTakenBy?: number;
  reviewedAt?: string;
  rejectionReason?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  stationId?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.220.2:8080';

export default function PoliceReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  const [report, setReport] = useState<CrimeReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
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
      router.push('/police/login');
      return;
    }

    const cachedUser = localStorage.getItem('userData');
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    }

    if (reportId) {
        fetchReportDetails();
    }
  }, [reportId]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/reports/${reportId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Report not found: ${reportId}`);
        }
        throw new Error('Failed to fetch report details');
      }
      const data = await response.json();
      setReport(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch report details');
    } finally {
      setLoading(false);
    }
  };

  const updatePoliceStatus = async (newPoliceStatus: string, feedback?: string, files?: File[]) => {
    if (!user?.id || !report) return;

    try {
      setUpdatingStatus(true);

      const formData = new FormData();
      formData.append('reportId', reportId);
      formData.append('policeStatus', newPoliceStatus);
      formData.append('officerId', user.id);
      formData.append('feedback', feedback || '');

      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('actionProof', file);
        });
      }

      const response = await fetch(`${API_URL}/api/reports/update-police-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update police status');

      setReport(prev => prev ? {
        ...prev,
        policeStatus: newPoliceStatus as any,
        policeFeedback: feedback,
        actionTakenAt: new Date().toISOString()
      } : null);

      setShowActionModal(false);
      setActionFeedback('');
      setActionFiles([]);

      alert(`Police status updated to ${newPoliceStatus}`);
    } catch (err: any) {
      alert('Failed to update police status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'ACTION_TAKEN' || newStatus === 'RESOLVED') {
      setShowActionModal(true);
    } else {
      updatePoliceStatus(newStatus);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setActionFiles(Array.from(e.target.files));
    }
  };

  const submitActionWithFiles = () => {
    if (!report) return;

    const newStatus = report.policeStatus;

    if (newStatus === 'RESOLVED' && actionFiles.length === 0) {
      alert('Please upload evidence files when resolving a report.');
      return;
    }

    if (!actionFeedback.trim()) {
      alert('Please provide feedback about the action taken.');
      return;
    }

    updatePoliceStatus(newStatus, actionFeedback, actionFiles);
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

  const handleBack = () => {
    router.push('/police/reports');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C3B091] to-[#8B7B5A] text-white flex items-center justify-center light:from-[#E6D4A8] light:to-[#A69875]">
        <div className="text-center">Loading report details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C3B091] to-[#8B7B5A] text-white transition-colors duration-500 dark:from-[#C3B091] dark:to-[#8B7B5A] light:from-[#E6D4A8] light:to-[#A69875]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-20">
        <div className="particle-layer"></div>
        <div className="shimmer-layer"></div>
      </div>

      <Sidebar />

      <main className="ml-0 p-4 transition-all duration-300 md:ml-[80px] md:p-8 lg:ml-[260px]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl">
          <div className="mb-8">
            <PoliceHeader />
          </div>

          <div className="pt-8 flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[#C3B091] dark:text-[#8B7B5A]">Report Details</h2>
            <Button
              onClick={handleBack}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700"
            >
              Back to Reports
            </Button>
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

          {!report ? (
            <div className="text-center text-gray-400 light:text-gray-600">
              No report data available for ID: {reportId}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-12 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl transition-all duration-300 dark:bg-gray-800 dark:bg-opacity-60 light:border-gray-300 light:bg-white light:bg-opacity-80"
            >
              <div className="border-b border-gray-700 p-6 light:border-gray-200">
                <h3 className="text-xl font-bold text-[#C3B091] light:text-[#8B7B5A]">Report ID: {report.reportId}</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-300 light:text-gray-700">General Information</h4>
                  <dl className="mt-4 space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Crime Type</dt>
                      <dd className="mt-1 text-gray-200 light:text-gray-800">{report.crimeType} (ID: {report.crimeTypeId || 'N/A'})</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Category</dt>
                      <dd className="mt-1 text-gray-200 light:text-gray-800">{report.categoryName || 'N/A'} (ID: {report.categoryId || 'N/A'})</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Police Status</dt>
                      <dd className="mt-1">
                        <select
                          value={report.policeStatus}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          disabled={updatingStatus}
                          className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-[#C3B091] light:border-gray-300 light:bg-white light:text-gray-900"
                        >
                          <option value="NOT_VIEWED">Not Viewed</option>
                          <option value="VIEWED">Viewed</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="ACTION_TAKEN">Action Taken</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400 light:text-gray-600">ML Status</dt>
                      <dd className="mt-1">{getStatusBadge(report.status)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Admin Status</dt>
                      <dd className="mt-1">{getAdminStatusBadge(report.adminStatus)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Priority</dt>
                      <dd className="mt-1">{getPriorityBadge(report.urgency)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Submitted At</dt>
                      <dd className="mt-1 text-gray-200 light:text-gray-800">{new Date(report.submittedAt).toLocaleString()}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-300 light:text-gray-700">Location Details</h4>
                  <dl className="mt-4 space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Address</dt>
                      <dd className="mt-1 text-gray-200 light:text-gray-800">{report.address || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400 light:text-gray-600">City</dt>
                      <dd className="mt-1 text-gray-200 light:text-gray-800">{report.city || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400 light:text-gray-600">State</dt>
                      <dd className="mt-1 text-gray-200 light:text-gray-800">{report.state || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Police Station</dt>
                      <dd className="mt-1 text-gray-200 light:text-gray-800">{report.policeStation || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-300 light:text-gray-700">Description</h4>
                  <dl className="mt-4 space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Original Description</dt>
                      <dd className="mt-1 text-gray-200 light:text-gray-800">{report.originalDescription || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Processed Description</dt>
                      <dd className="mt-1 text-gray-200 light:text-gray-800">{report.processedDescription || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>
                {report.policeFeedback && (
                  <div className="md:col-span-2">
                    <h4 className="text-lg font-semibold text-gray-300 light:text-gray-700">Police Action Details</h4>
                    <dl className="mt-4 space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Action Taken</dt>
                        <dd className="mt-1 text-gray-200 light:text-gray-800">{report.policeFeedback}</dd>
                      </div>
                      {report.actionTakenAt && (
                        <div>
                          <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Action Taken At</dt>
                          <dd className="mt-1 text-gray-200 light:text-gray-800">{new Date(report.actionTakenAt).toLocaleString()}</dd>
                        </div>
                      )}
                      {report.policeActionProof && report.policeActionProof.length > 0 && (
                        <div>
                          <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Evidence Files</dt>
                          <dd className="mt-1">
                            <ul className="list-disc list-inside">
                              {report.policeActionProof.map((proof, index) => (
                                <li key={index} className="text-gray-200 light:text-gray-800">
                                  <a href={proof} target="_blank" rel="noopener noreferrer" className="text-[#C3B091] hover:underline">
                                    Evidence {index + 1}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
                <div className="md:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-300 light:text-gray-700">Analysis Scores</h4>
                  <dl className="mt-4 space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Confidence Score</dt>
                      <dd className="mt-1 text-gray-200 light:text-gray-800">{report.confidenceScore !== null ? report.confidenceScore.toFixed(2) : 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Spam Score</dt>
                      <dd className="mt-1 text-gray-200 light:text-gray-800">{report.spamScore !== null ? report.spamScore.toFixed(2) : 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Report Quality</dt>
                      <dd className="mt-1 text-gray-200 light:text-gray-800">{report.reportQuality || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Action Taken Modal */}
      {showActionModal && report && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 max-w-full mx-4 light:bg-white light:text-gray-900">
            <h3 className="text-lg font-bold mb-4">
              {report.policeStatus === 'ACTION_TAKEN' ? 'Action Taken Details' : 'Resolve Report'}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Feedback *</label>
              <textarea
                value={actionFeedback}
                onChange={(e) => setActionFeedback(e.target.value)}
                placeholder={
                  report.policeStatus === 'ACTION_TAKEN'
                    ? "Describe the action taken..."
                    : "Describe how the issue was resolved..."
                }
                className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white mb-4 light:bg-gray-100 light:border-gray-300 light:text-gray-900"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Upload Evidence {report.policeStatus === 'RESOLVED' && '*'}
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
                {report.policeStatus === 'RESOLVED' && ' - Required for resolution'}
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setActionFeedback('');
                  setActionFiles([]);
                }}
                className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 text-white light:bg-gray-300 light:hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={submitActionWithFiles}
                disabled={updatingStatus || !actionFeedback.trim() || (report.policeStatus === 'RESOLVED' && actionFiles.length === 0)}
                className="px-4 py-2 bg-[#C3B091] rounded-lg hover:bg-[#8B7B5A] text-white disabled:opacity-50 light:bg-[#8B7B5A] light:hover:bg-[#7A6A49]"
              >
                {updatingStatus ? 'Submitting...' : 'Submit'}
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