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
}

interface Authority {
    id: number;
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: string;
    stationId: number | null;
    stationName: string;
    createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.220.2:8080';

export default function AddOfficerPage() {
    const router = useRouter();
    const [officerData, setOfficerData] = useState<Authority>({
        id: 0,
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'POLICE',
        stationId: null,
        stationName: '',
        createdAt: '',
    });
    const [stations, setStations] = useState<PoliceStation[]>([]);
    const [officers, setOfficers] = useState<Authority[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [officersLoading, setOfficersLoading] = useState(true);
    const [officersError, setOfficersError] = useState('');
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
        fetchOfficers();
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

    const getAuthToken = () => {
        return localStorage.getItem('token') || localStorage.getItem('authToken');
    };

    const fetchStations = async () => {
        try {
            const token = getAuthToken();
            if (!token) {
                setError('No authentication token found. Please log in again.');
                return;
            }

            const response = await fetch(`${API_URL}/api/police-stations/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('authToken');
                    setError('Session expired. Please log in again.');
                    return;
                }

                const errorText = await response.text();
                throw new Error(`Failed to fetch police stations: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            setStations(Array.isArray(data) ? data : []);
            if (data.length > 0 && !officerData.stationId) {
                setOfficerData(prev => ({ ...prev, stationId: data[0].id }));
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load police stations');
        }
    };

    const fetchOfficers = async () => {
        setOfficersLoading(true);
        setOfficersError('');
        try {
            const token = getAuthToken();
            if (!token) {
                setOfficersError('No authentication token found. Please log in again.');
                return;
            }

            const response = await fetch(`${API_URL}/api/authority/police`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('authToken');
                    setOfficersError('Session expired. Please log in again.');
                    return;
                }

                const errorText = await response.text();
                throw new Error(`Failed to fetch officers: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const formattedOfficers = data.map((officer: any) => ({
                ...officer,
                stationName: officer.station ? officer.station.name : 'Unassigned',
                stationId: officer.station ? officer.station.id : null,
            }));
            setOfficers(Array.isArray(formattedOfficers) ? formattedOfficers : []);
        } catch (err: any) {
            setOfficersError(err.message || 'Failed to fetch officers');
        } finally {
            setOfficersLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload: any = {
                name: officerData.name,
                email: officerData.email,
                password: officerData.password,
                phoneNumber: officerData.phoneNumber,
            };

            if (officerData.stationId && officerData.stationId > 0) {
                payload.stationId = officerData.stationId;
            }

            const token = getAuthToken();
            if (!token) {
                setError('No authentication token found. Please log in again.');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/api/authority/create-police`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('authToken');
                    setError('Session expired. Please log in again.');
                    setLoading(false);
                    return;
                }

                let errorMessage = 'Failed to add officer';
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (jsonErr) {
                    const text = await response.text();
                    if (text) {
                        errorMessage = text;
                    }
                }
                throw new Error(errorMessage);
            }

            setSuccess('Officer added successfully!');
            setOfficerData({
                id: 0,
                name: '',
                email: '',
                password: '',
                phoneNumber: '',
                role: 'POLICE',
                stationId: null,
                stationName: '',
                createdAt: '',
            });
            fetchOfficers();
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to add officer');
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

    const filteredOfficers = officers.filter(officer =>
        officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        officer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        officer.stationName.toLowerCase().includes(searchQuery.toLowerCase())
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
                    title="Manage Police Officers"
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
                            <h3 className="text-xl font-bold text-blue-300 light:text-blue-700">Add New Police Officer</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 p-6">
                            <div>
                                <label htmlFor="officerName" className="block text-gray-300 mb-2 font-medium light:text-gray-700">Officer Name</label>
                                <input
                                    id="officerName"
                                    type="text"
                                    value={officerData.name}
                                    onChange={(e) => setOfficerData({ ...officerData, name: e.target.value })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
                                    placeholder="e.g., John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="officerEmail" className="block text-gray-300 mb-2 font-medium light:text-gray-700">Email</label>
                                <input
                                    id="officerEmail"
                                    type="email"
                                    value={officerData.email}
                                    onChange={(e) => setOfficerData({ ...officerData, email: e.target.value })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
                                    placeholder="e.g., officer@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="officerPassword" className="block text-gray-300 mb-2 font-medium light:text-gray-700">Password</label>
                                <input
                                    id="officerPassword"
                                    type="password"
                                    value={officerData.password}
                                    onChange={(e) => setOfficerData({ ...officerData, password: e.target.value })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
                                    placeholder="Enter a secure password"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="officerPhone" className="block text-gray-300 mb-2 font-medium light:text-gray-700">Phone Number</label>
                                <input
                                    id="officerPhone"
                                    type="tel"
                                    value={officerData.phoneNumber}
                                    onChange={(e) => setOfficerData({ ...officerData, phoneNumber: e.target.value })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 light:bg-gray-100 light:border-gray-300 light:text-gray-900 light:placeholder-gray-500"
                                    placeholder="e.g., +1234567890"
                                />
                            </div>

                            <div>
                                <label htmlFor="officerStation" className="block text-gray-300 mb-2 font-medium light:text-gray-700">Police Station</label>
                                <select
                                    id="officerStation"
                                    value={officerData.stationId || ''}
                                    onChange={(e) => setOfficerData({ ...officerData, stationId: e.target.value ? parseInt(e.target.value) : null })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 light:bg-gray-100 light:border-gray-300 light:text-gray-900"
                                >
                                    <option value="">Select a station (optional)</option>
                                    {stations.length === 0 ? (
                                        <option value="">No stations available</option>
                                    ) : (
                                        stations.map((station) => (
                                            <option key={station.id} value={station.id}>
                                                {station.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold text-lg tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed light:bg-blue-700 light:hover:bg-blue-800 light:text-white"
                                >
                                    {loading ? 'Adding Officer...' : 'Add Officer'}
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
                            <h3 className="text-xl font-bold text-purple-300 light:text-purple-700">Existing Officers</h3>
                            <Button
                                onClick={fetchOfficers}
                                className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-4 py-2 rounded-md text-sm transition-all duration-200 light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700 light:hover:text-gray-900"
                                title="Refresh Officers"
                            >
                                Refresh
                            </Button>
                        </div>

                        <div className="p-6">
                            <input
                                type="text"
                                placeholder="Search officers by name, email, or station..."
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
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Phone Number</th>
                                        <th className="p-4">Station</th>
                                        <th className="p-4">Created At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {officersLoading ? (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-gray-400 light:text-gray-600">
                                                Loading officers...
                                            </td>
                                        </tr>
                                    ) : officersError ? (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-red-400 light:text-red-600">
                                                {officersError}
                                            </td>
                                        </tr>
                                    ) : filteredOfficers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-gray-400 light:text-gray-600">
                                                No officers found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOfficers.map((officer) => (
                                            <motion.tr
                                                key={officer.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="border-b border-gray-800 hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200 light:border-gray-200 light:hover:bg-gray-100"
                                            >
                                                <td className="p-4 font-medium text-blue-200 light:text-blue-700">{officer.name}</td>
                                                <td className="p-4 text-gray-400 light:text-gray-600">{officer.email}</td>
                                                <td className="p-4 text-gray-400 light:text-gray-600">{officer.phoneNumber || 'N/A'}</td>
                                                <td className="p-4 text-gray-400 light:text-gray-600">{officer.stationName}</td>
                                                <td className="p-4 text-gray-400 text-sm light:text-gray-600">{formatTimestamp(officer.createdAt)}</td>
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