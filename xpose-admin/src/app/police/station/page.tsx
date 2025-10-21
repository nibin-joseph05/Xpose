'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/police/Sidebar';
import PoliceHeader from '@/components/police/PoliceHeader';
import Map from '@/components/police/maps/Map';

interface PoliceOfficer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  stationId?: string;
  stationName?: string;
}

interface PoliceStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

interface StationData {
  station: PoliceStation;
  officers: PoliceOfficer[];
  totalOfficers: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.220.2:8080';

export default function PoliceStationPage() {
  const [stationData, setStationData] = useState<StationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const theme = savedTheme === 'light' ? 'light' : 'dark';
    setTheme(theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, []);

  useEffect(() => {
    const fetchStationData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('No authentication token found. Please log in.');
          router.push('/police/login');
          return;
        }

        const response = await fetch(`${API_URL}/api/police-stations/my-station`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            const errorData = await response.json();
            setError(errorData.message || 'No station assigned to your account');
          } else {
            throw new Error(`Failed to fetch station data: ${response.statusText}`);
          }
          return;
        }

        const data = await response.json();
        setStationData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch station data');
      } finally {
        setLoading(false);
      }
    };

    fetchStationData();
  }, [router]);

  const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className={`rounded-xl border ${color} bg-gray-800 bg-opacity-60 p-6 shadow-lg transition-all duration-300 ease-in-out dark:bg-gray-800 dark:bg-opacity-60 light:border-gray-200 light:bg-white light:bg-opacity-80`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm text-gray-400 light:text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-50 light:text-gray-800">{value}</h3>
        </div>
        <div className="text-3xl text-[#C3B091] light:text-[#8B7B5A]">{icon}</div>
      </div>
    </motion.div>
  );

  const OfficerCard = ({ officer }: { officer: PoliceOfficer }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-gray-700 bg-gray-800 bg-opacity-60 p-4 light:border-gray-300 light:bg-white light:bg-opacity-80"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-100 light:text-gray-800">{officer.name}</h4>
          <p className="text-sm text-gray-400 light:text-gray-600 mt-1">{officer.email}</p>
          <p className="text-sm text-gray-400 light:text-gray-600">{officer.phoneNumber || 'No phone'}</p>
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-300 ring-1 ring-inset ring-blue-600/30 light:bg-blue-100 light:text-blue-800 light:ring-blue-300">
              {officer.role}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500 light:text-gray-400">
        Joined: {new Date(officer.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C3B091] to-[#8B7B5A] text-white transition-colors duration-500 dark:from-[#C3B091] dark:to-[#8B7B5A] light:from-[#E6D4A8] light:to-[#A69875]">
        <Sidebar />
        <main className="ml-0 p-4 transition-all duration-300 md:ml-[80px] md:p-8 lg:ml-[260px]">
          <div className="flex items-center justify-center h-96">
            <div className="text-xl text-gray-300 light:text-gray-600">Loading station data...</div>
          </div>
        </main>
      </div>
    );
  }

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

          {stationData && (
            <>
              {/* Station Overview */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3"
              >
                <StatCard
                  title="Station Name"
                  value={stationData.station.name}
                  icon="🏢"
                  color="border-[#C3B091]"
                />
                <StatCard
                  title="Total Officers"
                  value={stationData.totalOfficers}
                  icon="👮"
                  color="border-blue-500"
                />
                <StatCard
                  title="Station ID"
                  value={`#${stationData.station.id}`}
                  icon="🆔"
                  color="border-green-500"
                />
              </motion.div>

              {/* Station Details */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2"
              >
                {/* Station Information */}
                <div className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-6 shadow-xl light:border-gray-300 light:bg-white light:bg-opacity-80">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-100 light:text-gray-800">
                    <span>🏢</span> Station Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400 light:text-gray-600">Station Name</label>
                      <p className="text-lg text-gray-100 light:text-gray-800">{stationData.station.name}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-400 light:text-gray-600">Address</label>
                      <p className="text-gray-300 light:text-gray-700">{stationData.station.address}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400 light:text-gray-600">Latitude</label>
                        <p className="text-gray-300 light:text-gray-700">{stationData.station.latitude?.toFixed(6) || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400 light:text-gray-600">Longitude</label>
                        <p className="text-gray-300 light:text-gray-700">{stationData.station.longitude?.toFixed(6) || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400 light:text-gray-600">Established</label>
                        <p className="text-gray-300 light:text-gray-700">
                          {new Date(stationData.station.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400 light:text-gray-600">Last Updated</label>
                        <p className="text-gray-300 light:text-gray-700">
                          {new Date(stationData.station.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Station Officers */}
                <div className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-6 shadow-xl light:border-gray-300 light:bg-white light:bg-opacity-80">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-gray-100 light:text-gray-800">
                      <span>👮</span> Station Officers ({stationData.totalOfficers})
                    </h2>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {stationData.officers.length === 0 ? (
                      <div className="text-center text-gray-400 light:text-gray-600 py-8">
                        No officers assigned to this station
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {stationData.officers.map((officer, index) => (
                          <OfficerCard key={officer.id} officer={officer} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Map Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 p-6 shadow-xl light:border-gray-300 light:bg-white light:bg-opacity-80"
              >
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-100 light:text-gray-800">
                  <span>🗺️</span> Station Location
                </h2>

                {stationData.station.latitude && stationData.station.longitude ? (
                  <>
                    <p className="mb-3 text-sm text-gray-400 light:text-gray-600">
                      Coordinates: {stationData.station.latitude.toFixed(6)}, {stationData.station.longitude.toFixed(6)}
                    </p>
                    <Map
                      lat={stationData.station.latitude}
                      lng={stationData.station.longitude}
                    />
                  </>
                ) : (
                  <p className="text-gray-400 light:text-gray-600">Location coordinates not available</p>
                )}
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