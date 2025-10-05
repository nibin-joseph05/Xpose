'use client';

import { useState, useEffect, useMemo } from 'react';
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
  updatedAt: string;
}

interface Authority {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  stationId: number;
  stationName: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.220.2:8080';

export default function StationsPage() {
  const router = useRouter();
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [officers, setOfficers] = useState<Authority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [stationSearchQuery, setStationSearchQuery] = useState('');
  const [officerSearchQuery, setOfficerSearchQuery] = useState('');
  const [currentPageStations, setCurrentPageStations] = useState(1);
  const [currentPageOfficers, setCurrentPageOfficers] = useState(1);
  const [itemsPerPageStations] = useState(10);
  const [itemsPerPageOfficers] = useState(10);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme === 'light' ? 'light' : 'dark');
    } else {
      setTheme('dark');
    }
    fetchData();
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

  const fetchData = async () => {
      try {
          setLoading(true);

          const stationsResponse = await fetch(`${API_URL}/api/police-stations/all`);
          if (!stationsResponse.ok) {
              const errorText = await stationsResponse.text();
              throw new Error(`Failed to fetch police stations: ${stationsResponse.status} - ${errorText}`);
          }
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

  const normalizeString = (str: string) => {
    return str.toLowerCase().replace(/\s+/g, '');
  };

  const filteredStations = useMemo(() => {
    const normalizedQuery = normalizeString(stationSearchQuery);
    return stations.filter(station =>
      normalizeString(station.name).includes(normalizedQuery) ||
      normalizeString(station.address).includes(normalizedQuery)
    );
  }, [stations, stationSearchQuery]);

  const totalPagesStations = Math.ceil(filteredStations.length / itemsPerPageStations);
  const paginatedStations = useMemo(() => {
    const startIndex = (currentPageStations - 1) * itemsPerPageStations;
    const endIndex = startIndex + itemsPerPageStations;
    return filteredStations.slice(startIndex, endIndex);
  }, [filteredStations, currentPageStations, itemsPerPageStations]);

  const filteredOfficers = useMemo(() => {
    const normalizedQuery = normalizeString(officerSearchQuery);
    return officers.filter(officer =>
      normalizeString(officer.name).includes(normalizedQuery) ||
      normalizeString(officer.email).includes(normalizedQuery) ||
      normalizeString(officer.stationName).includes(normalizedQuery)
    );
  }, [officers, officerSearchQuery]);

  const totalPagesOfficers = Math.ceil(filteredOfficers.length / itemsPerPageOfficers);
  const paginatedOfficers = useMemo(() => {
    const startIndex = (currentPageOfficers - 1) * itemsPerPageOfficers;
    const endIndex = startIndex + itemsPerPageOfficers;
    return filteredOfficers.slice(startIndex, endIndex);
  }, [filteredOfficers, currentPageOfficers, itemsPerPageOfficers]);

  const handlePageChangeStations = (page: number) => {
    setCurrentPageStations(page);
  };

  const handlePageChangeOfficers = (page: number) => {
    setCurrentPageOfficers(page);
  };

  const handleDeleteStation = async (id: number) => {
    if (confirm('Are you sure you want to delete this police station? This action cannot be undone.')) {
      try {
        const response = await fetch(`${API_URL}/api/police-stations/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete police station');
        }
        setStations(prev => prev.filter(station => station.id !== id));
        fetchData();
        alert('Police station deleted successfully!');
      } catch (err: any) {
        console.error('Error deleting police station:', err);
        alert(err.message || 'Error deleting police station.');
      }
    }
  };

  const handleDeleteOfficer = async (id: number) => {
    if (confirm('Are you sure you want to delete this police officer? This action cannot be undone.')) {
      try {
        const response = await fetch(`${API_URL}/api/authority/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete officer');
        }
        setOfficers(prev => prev.filter(officer => officer.id !== id));
        fetchData();
        alert('Officer deleted successfully!');
      } catch (err: any) {
        console.error('Error deleting officer:', err);
        alert(err.message || 'Error deleting officer.');
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-indigo-950 text-white transition-colors duration-500 dark:from-gray-950 dark:to-indigo-950 light:from-blue-50 light:to-purple-50 light:text-gray-900">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-20">
        <div className="particle-layer"></div>
        <div className="shimmer-layer"></div>
      </div>

      <Sidebar />

      <main className="ml-0 p-4 transition-all duration-300 md:ml-[80px] md:p-8 lg:ml-[260px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-7xl"
        >
          <AdminHeader title="Police Stations & Officers" />

          <div className="pt-8 flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-blue-400 light:text-blue-700">Police Stations & Officers</h2>
            <div className="flex space-x-4">
              <Button
                onClick={() => router.push('/admin/stations/add-station')}
                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300 ease-out"
              >
                Add Police Station
              </Button>
              <Button
                onClick={() => router.push('/admin/stations/add-officer')}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300 ease-out"
              >
                Add Officer
              </Button>
            </div>
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
            className="mb-12 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl dark:hover:border-blue-600 transition-all duration-300 light:border-gray-300 light:bg-white light:bg-opacity-80 light:hover:border-blue-500"
          >
            <div className="border-b border-gray-700 p-6 flex justify-between items-center flex-wrap gap-4 light:border-gray-300">
              <h3 className="text-xl font-bold text-blue-300 light:text-blue-700">Police Stations</h3>
              <input
                type="text"
                placeholder="Search police stations..."
                value={stationSearchQuery}
                onChange={(e) => {
                  setStationSearchQuery(e.target.value);
                  setCurrentPageStations(1);
                }}
                className="flex-grow max-w-sm bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-gray-800 bg-opacity-70 backdrop-blur-sm border-b border-gray-700 text-gray-400 light:bg-white light:bg-opacity-80 light:border-gray-300 light:text-gray-600 z-10">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Address</th>
                    <th className="p-4">Coordinates</th>
                    <th className="p-4">Created At</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-400 light:text-gray-600">
                        Loading police stations...
                      </td>
                    </tr>
                  ) : filteredStations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-400 light:text-gray-600">
                        No police stations found matching your search.
                      </td>
                    </tr>
                  ) : (
                    paginatedStations.map((station) => (
                      <motion.tr
                        key={station.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-gray-800 hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200 light:border-gray-200 light:hover:bg-gray-100"
                      >
                        <td className="p-4 font-medium text-blue-200 light:text-gray-800">{station.name}</td>
                        <td className="p-4 text-gray-400 light:text-gray-700">{station.address}</td>
                        <td className="p-4 text-gray-400 light:text-gray-700">{station.latitude}, {station.longitude}</td>
                        <td className="p-4 text-gray-400 light:text-gray-700">{formatTimestamp(station.createdAt)}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteStation(station.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-red-400 hover:bg-red-800/50 hover:text-red-300 transition-colors duration-200 light:text-red-600 light:hover:bg-red-100 light:hover:text-red-800"
                            title="Delete Police Station"
                          >
                            Del
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPagesStations > 1 && (
              <div className="p-4 flex justify-center items-center space-x-2 border-t border-gray-700 light:border-gray-300">
                <Button
                  onClick={() => handlePageChangeStations(currentPageStations - 1)}
                  disabled={currentPageStations === 1}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white disabled:opacity-50 light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPagesStations }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => handlePageChangeStations(page)}
                    className={`px-3 py-1 rounded ${
                      currentPageStations === page
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700'
                    }`}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  onClick={() => handlePageChangeStations(currentPageStations + 1)}
                  disabled={currentPageStations === totalPagesStations}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white disabled:opacity-50 light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700"
                >
                  Next
                </Button>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl dark:hover:border-purple-600 transition-all duration-300 light:border-gray-300 light:bg-white light:bg-opacity-80 light:hover:border-purple-500"
          >
            <div className="border-b border-gray-700 p-6 flex justify-between items-center flex-wrap gap-4 light:border-gray-300">
              <h3 className="text-xl font-bold text-blue-300 light:text-blue-700">Police Officers</h3>
              <input
                type="text"
                placeholder="Search officers..."
                value={officerSearchQuery}
                onChange={(e) => {
                  setOfficerSearchQuery(e.target.value);
                  setCurrentPageOfficers(1);
                }}
                className="flex-grow max-w-sm bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-gray-800 bg-opacity-70 backdrop-blur-sm border-b border-gray-700 text-gray-400 light:bg-white light:bg-opacity-80 light:border-gray-300 light:text-gray-600 z-10">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone Number</th>
                    <th className="p-4">Station</th>
                    <th className="p-4">Created At</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-400 light:text-gray-600">
                        Loading officers...
                      </td>
                    </tr>
                  ) : filteredOfficers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-400 light:text-gray-600">
                        No officers found matching your search.
                      </td>
                    </tr>
                  ) : (
                    paginatedOfficers.map((officer) => (
                      <motion.tr
                        key={officer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-gray-800 hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200 light:border-gray-200 light:hover:bg-gray-100"
                      >
                        <td className="p-4 font-medium text-blue-200 light:text-gray-800">{officer.name}</td>
                        <td className="p-4 text-gray-400 light:text-gray-700">{officer.email}</td>
                        <td className="p-4 text-gray-400 light:text-gray-700">{officer.phoneNumber || 'N/A'}</td>
                        <td className="p-4 text-gray-400 light:text-gray-700">{officer.stationName}</td>
                        <td className="p-4 text-gray-400 light:text-gray-700">{formatTimestamp(officer.createdAt)}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteOfficer(officer.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-red-400 hover:bg-red-800/50 hover:text-red-300 transition-colors duration-200 light:text-red-600 light:hover:bg-red-100 light:hover:text-red-800"
                            title="Delete Officer"
                          >
                            Del
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPagesOfficers > 1 && (
              <div className="p-4 flex justify-center items-center space-x-2 border-t border-gray-700 light:border-gray-300">
                <Button
                  onClick={() => handlePageChangeOfficers(currentPageOfficers - 1)}
                  disabled={currentPageOfficers === 1}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white disabled:opacity-50 light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPagesOfficers }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => handlePageChangeOfficers(page)}
                    className={`px-3 py-1 rounded ${
                      currentPageOfficers === page
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700'
                    }`}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  onClick={() => handlePageChangeOfficers(currentPageOfficers + 1)}
                  disabled={currentPageOfficers === totalPagesOfficers}
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