'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/admin/ui/button';

interface PoliceStation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.220.2:8080';

export default function AddStationPage() {
  const router = useRouter();
  const [stationData, setStationData] = useState<PoliceStation>({
    id: 0,
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    createdAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [stationsLoading, setStationsLoading] = useState(true);
  const [stationsError, setStationsError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme === 'light' ? 'light' : 'dark');
    } else {
      setTheme('dark');
    }
    fetchStations();
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

  const fetchStations = async () => {
      setStationsLoading(true);
      setStationsError('');
      try {
          const response = await fetch(`${API_URL}/api/police-stations/all`);
          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Failed to fetch police stations: ${response.status} - ${errorText}`);
          }
          const data = await response.json();
          setStations(Array.isArray(data) ? data : []);
      } catch (err: any) {
          console.error('Error fetching stations:', err);
          setStationsError(err.message || 'Failed to fetch police stations');
      } finally {
          setStationsLoading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { id, createdAt, ...dataToSend } = stationData;
      const response = await fetch(`${API_URL}/api/police-stations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to add police station';
        try {
          const clonedResponse = response.clone();
          const errorData = await clonedResponse.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (jsonErr) {
          try {
            const text = await response.text();
            errorMessage = text;
          } catch (_) {}
        }
        throw new Error(errorMessage);
      }

      setSuccess('Police station added successfully!');
      setStationData({ id: 0, name: '', address: '', latitude: 0, longitude: 0, createdAt: '' });
      fetchStations();
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add police station');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-indigo-950 text-white transition-colors duration-500 dark:from-gray-950 dark:to-indigo-950 light:from-blue-50 light:to-purple-50 light:text-gray-900">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-20">
        <div className="particle-layer"></div>
        <div className="shimmer-layer"></div>
      </div>

      <Sidebar />

      <main className="ml-0 p-4 transition-all duration-300 md:ml-[80px] md:p-8 lg:ml-[260px]">
        <AdminHeader
          title="Manage Police Stations"
          backUrl="/admin/stations"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto pt-8 grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-2xl dark:hover:border-blue-500 transition-all duration-300 light:border-gray-300 light:bg-white light:bg-opacity-80 light:hover:border-blue-500"
          >
            <div className="border-b border-gray-700 p-6 flex justify-between items-center light:border-gray-300">
              <h3 className="text-xl font-bold text-blue-300 light:text-blue-700">Add New Police Station</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div>
                <label htmlFor="stationName" className="block text-gray-300 mb-2 font-medium light:text-gray-700">Station Name</label>
                <input
                  id="stationName"
                  type="text"
                  value={stationData.name}
                  onChange={(e) => setStationData({ ...stationData, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
                  placeholder="e.g., Central Police Station"
                  required
                />
              </div>

              <div>
                <label htmlFor="stationAddress" className="block text-gray-300 mb-2 font-medium light:text-gray-700">Address</label>
                <textarea
                  id="stationAddress"
                  value={stationData.address}
                  onChange={(e) => setStationData({ ...stationData, address: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-y min-h-[100px] light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
                  rows={4}
                  placeholder="e.g., 123 Main Street, City, State"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="latitude" className="block text-gray-300 mb-2 font-medium light:text-gray-700">Latitude</label>
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    value={stationData.latitude}
                    onChange={(e) => setStationData({ ...stationData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
                    placeholder="e.g., 12.9716"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="longitude" className="block text-gray-300 mb-2 font-medium light:text-gray-700">Longitude</label>
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    value={stationData.longitude}
                    onChange={(e) => setStationData({ ...stationData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
                    placeholder="e.g., 77.5946"
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold text-lg tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed light:bg-blue-700 light:hover:bg-blue-800 light:text-white"
                >
                  {loading ? 'Adding Station...' : 'Add Police Station'}
                </Button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900 text-red-200 p-4 rounded-lg border border-red-700 mt-4 font-medium light:bg-red-100 light:text-red-700 light:border-red-300"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-900 text-green-200 p-4 rounded-lg border border-green-700 mt-4 font-medium light:bg-green-100 light:text-green-700 light:border-green-300"
                >
                  {success}
                </motion.div>
              )}
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-2xl dark:hover:border-purple-500 transition-all duration-300 light:border-gray-300 light:bg-white light:bg-opacity-80 light:hover:border-purple-500"
          >
            <div className="border-b border-gray-700 p-6 flex justify-between items-center light:border-gray-300">
              <h3 className="text-xl font-bold text-purple-300 light:text-purple-700">Existing Police Stations</h3>
              <Button
                onClick={fetchStations}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-4 py-2 rounded-md text-sm transition-all duration-200 light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700 light:hover:text-gray-900"
                title="Refresh Police Stations"
              >
                Refresh
              </Button>
            </div>

            <div className="p-6">
              <input
                type="text"
                placeholder="Search stations by name or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 mb-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
              />
            </div>

            <div className="overflow-y-auto max-h-[400px]">
              <table className="w-full">
                <thead>
                  <tr className="sticky top-0 bg-gray-800 bg-opacity-70 backdrop-blur-sm border-b border-gray-700 text-left text-gray-400 light:bg-white light:bg-opacity-80 light:border-gray-300 light:text-gray-600 z-10">
                    <th className="p-4">Name</th>
                    <th className="p-4">Address</th>
                    <th className="p-4">Coordinates</th>
                    <th className="p-4">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {stationsLoading ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-400 light:text-gray-600">
                        Loading police stations...
                      </td>
                    </tr>
                  ) : stationsError ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-red-400 light:text-red-600">
                        {stationsError}
                      </td>
                    </tr>
                  ) : filteredStations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-400 light:text-gray-600">
                        No police stations found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredStations.map((station) => (
                      <motion.tr
                        key={station.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-gray-800 hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200 light:border-gray-200 light:hover:bg-gray-100"
                      >
                        <td className="p-4 font-medium text-blue-200 light:text-blue-700">{station.name}</td>
                        <td className="p-4 text-gray-400 light:text-gray-600">{station.address}</td>
                        <td className="p-4 text-gray-400 light:text-gray-600">{station.latitude}, {station.longitude}</td>
                        <td className="p-4 text-gray-400 text-sm light:text-gray-600">{formatTimestamp(station.createdAt)}</td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
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