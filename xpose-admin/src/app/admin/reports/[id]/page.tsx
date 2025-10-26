
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import MLInsights from '@/components/admin/report/MLInsights';
import { Button } from '@/components/admin/ui/button';

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
  reviewedAt?: string;
  rejectionReason?: string;
  evidenceCount?: number;
  attachments?: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.220.2:8080';

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;

  const [report, setReport] = useState<CrimeReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme === 'light' ? 'light' : 'dark');
    } else {
      setTheme('dark');
    }
    fetchReportDetails();
  }, [reportId]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/reports/${reportId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Report not found: ${reportId}`);
        }
        throw new Error('Failed to fetch report details');
      }
      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      console.error('Error fetching report details:', err);
      setError(err.message || 'Failed to fetch report details');
    } finally {
      setLoading(false);
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

  const getEvidenceCount = () => {
    if (!report) return 0;


    if (report.evidenceCount !== undefined) {
      return report.evidenceCount;
    }


    if (report.attachments && Array.isArray(report.attachments)) {
      return report.attachments.length;
    }

    return 0;
  };

  const handleBack = () => {
    router.push('/admin/reports');
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
          <AdminHeader title={`Report Details: ${reportId}`} />

          <div className="pt-8 flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-blue-400 light:text-blue-700">Report Details</h2>
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

          {loading ? (
            <div className="text-center text-gray-400 light:text-gray-600">Loading report details...</div>
          ) : !report ? (
            <div className="text-center text-gray-400 light:text-gray-600">
              No report data available for ID: {reportId}. Please check the report ID or contact support at nibinjoseph2019@gmail.com.
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-12 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl dark:hover:border-blue-600 transition-all duration-300 light:border-gray-300 light:bg-white light:bg-opacity-80 light:hover:border-blue-500"
              >
                <div className="border-b border-gray-700 p-6 light:border-gray-300">
                  <h3 className="text-xl font-bold text-blue-300 light:text-blue-700">Report ID: {report.reportId}</h3>
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
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">ML Status</dt>
                        <dd className="mt-1">{getStatusBadge(report.status)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Admin Status</dt>
                        <dd className="mt-1">{getAdminStatusBadge(report.adminStatus)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Police Status</dt>
                        <dd className="mt-1">{getPoliceStatusBadge(report.policeStatus)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Priority</dt>
                        <dd className="mt-1">{getPriorityBadge(report.urgency)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Submitted At</dt>
                        <dd className="mt-1 text-gray-200 light:text-gray-800">{report.submittedAt ? new Date(report.submittedAt).toLocaleString() : 'N/A'}</dd>
                      </div>
                      {/* Evidence Count Display */}
                      <div>
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Evidence Submitted</dt>
                        <dd className="mt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            getEvidenceCount() > 0
                              ? 'bg-green-600/20 text-green-300 ring-1 ring-inset ring-green-600/30 light:bg-green-100 light:text-green-800 light:ring-green-300'
                              : 'bg-gray-600/20 text-gray-300 ring-1 ring-inset ring-gray-600/30 light:bg-gray-100 light:text-gray-800 light:ring-gray-300'
                          }`}>
                            {getEvidenceCount()} {getEvidenceCount() === 1 ? 'file' : 'files'}
                          </span>
                        </dd>
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
                  <div className="md:col-span-2">
                    <h4 className="text-lg font-semibold text-gray-300 light:text-gray-700">Police Action Details</h4>
                    <dl className="mt-4 space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Assigned Officer ID</dt>
                        <dd className="mt-1 text-gray-200 light:text-gray-800">{report.assignedOfficerId || 'Not Assigned'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Police Feedback</dt>
                        <dd className="mt-1 text-gray-200 light:text-gray-800">{report.policeFeedback || 'No feedback provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Action Taken At</dt>
                        <dd className="mt-1 text-gray-200 light:text-gray-800">{report.actionTakenAt ? new Date(report.actionTakenAt).toLocaleString() : 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Reviewed At</dt>
                        <dd className="mt-1 text-gray-200 light:text-gray-800">{report.reviewedAt ? new Date(report.reviewedAt).toLocaleString() : 'N/A'}</dd>
                      </div>
                      {report.rejectionReason && (
                        <div>
                          <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Rejection Reason</dt>
                          <dd className="mt-1 text-gray-200 light:text-gray-800">{report.rejectionReason}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
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
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Toxicity Scores</dt>
                        <dd className="mt-1 text-gray-200 light:text-gray-800">
                          {report.toxicityScores ? (
                            <pre className="bg-gray-700 p-2 rounded text-sm light:bg-gray-100">{JSON.stringify(report.toxicityScores, null, 2)}</pre>
                          ) : (
                            'N/A'
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">SHAP Explanation</dt>
                        <dd className="mt-1 text-gray-200 light:text-gray-800">
                          {report.shapExplanation ? (
                            <pre className="bg-gray-700 p-2 rounded text-sm light:bg-gray-100">{JSON.stringify(report.shapExplanation, null, 2)}</pre>
                          ) : (
                            'N/A'
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Report Quality</dt>
                        <dd className="mt-1 text-gray-200 light:text-gray-800">{report.reportQuality || 'N/A'}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-lg font-semibold text-gray-300 light:text-gray-700">Blockchain Information</h4>
                    <dl className="mt-4 space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Blockchain Hash</dt>
                        <dd className="mt-1 text-gray-200 light:text-gray-800">{report.blockchainHash || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Blockchain Timestamp</dt>
                        <dd className="mt-1 text-gray-200 light:text-gray-800">{report.blockchainTimestamp ? new Date(report.blockchainTimestamp).toLocaleString() : 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Blockchain Transaction ID</dt>
                        <dd className="mt-1 text-gray-200 light:text-gray-800">{report.blockchainTxId || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-400 light:text-gray-600">Raw Blockchain Data</dt>
                        <dd className="mt-1 text-gray-200 light:text-gray-800">
                          {report.rawBlockchainData ? (
                            <pre className="bg-gray-700 p-2 rounded text-sm light:bg-gray-100">{report.rawBlockchainData}</pre>
                          ) : (
                            'N/A'
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="md:col-span-2">
                    <MLInsights
                      toxicityScores={report.toxicityScores}
                      shapExplanation={report.shapExplanation}
                      reportStatus={report.status}
                      reportQuality={report.reportQuality}
                    />
                  </div>
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