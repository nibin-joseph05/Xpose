'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    pending: 0,
    resolved: 0,
    urgent: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        totalReports: 1423,
        pending: 324,
        resolved: 1099,
        urgent: 87,
      });
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className={`rounded-xl border ${color} bg-gray-800 bg-opacity-60 p-6 shadow-lg transition-all duration-300 ease-in-out dark:bg-gray-800 dark:bg-opacity-60 light:border-gray-200 light:bg-white light:bg-opacity-80`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-2 text-gray-400 light:text-gray-600">{title}</p>
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-gray-700 light:bg-gray-200"></div>
          ) : (
            <h3 className="text-3xl font-bold text-gray-50 light:text-gray-800">{value}</h3>
          )}
        </div>
        <div className="text-4xl text-blue-400 light:text-blue-600">{icon}</div>
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard
              title="Total Reports"
              value={stats.totalReports}
              icon="📋"
              color="border-blue-500"
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              icon="⏳"
              color="border-yellow-500"
            />
            <StatCard
              title="Resolved"
              value={stats.resolved}
              icon="✅"
              color="border-green-500"
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
                  {[1, 2, 3, 4, 5].map((item) => (
                    <tr
                      key={item}
                      className="border-b border-gray-800 transition-colors hover:bg-gray-700 hover:bg-opacity-50 light:border-gray-100 light:hover:bg-gray-50"
                    >
                      <td className="p-4">#RPT-{item}00{item}</td>
                      <td className="p-4">Theft</td>
                      <td className="p-4">Downtown</td>
                      <td className="p-4">
                        <span className="rounded-full bg-yellow-900 bg-opacity-50 px-3 py-1 text-xs text-yellow-300 light:bg-yellow-200 light:text-yellow-800">
                          Pending
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-red-900 bg-opacity-50 px-3 py-1 text-xs text-red-300 light:bg-red-200 light:text-red-800">
                          High
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-gray-700 p-4 light:border-gray-200">
              <button className="flex items-center gap-2 text-blue-400 transition-colors hover:text-blue-300 light:text-blue-600 light:hover:text-blue-500">
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
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-100 light:text-gray-800">
                <span>📈</span> Reports Overview
              </h3>
              <div className="flex h-64 items-center justify-center rounded-lg border border-gray-700 bg-gray-900 bg-opacity-30 light:bg-gray-100 light:border-gray-200">
                <span className="text-gray-500 light:text-gray-400">Chart visualization will appear here</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-6 light:bg-white light:bg-opacity-80 light:border-gray-300">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-100 light:text-gray-800">
                <span>📍</span> Crime Hotspots
              </h3>
              <div className="flex h-64 items-center justify-center rounded-lg border border-gray-700 bg-gray-900 bg-opacity-30 light:bg-gray-100 light:border-gray-200">
                <span className="text-gray-500 light:text-gray-400">Map visualization will appear here</span>
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