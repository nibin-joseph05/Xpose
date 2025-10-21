'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/police/Sidebar';
import PoliceHeader from '@/components/police/PoliceHeader';
import { Button } from '@/components/police/ui/button';

interface PoliceProfile {
  id: number;
  name: string;
  email: string;
  password?: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  stationId?: string;
  stationName?: string;
  station?: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
}

export default function PoliceSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PoliceProfile>({
    id: 0,
    name: '',
    email: '',
    phoneNumber: '',
    role: '',
    createdAt: '',
    updatedAt: '',
  });
  const [editableProfile, setEditableProfile] = useState<PoliceProfile>({ ...profile });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [profileUpdateError, setProfileUpdateError] = useState('');
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

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
    } else {
      fetchPoliceProfile(token);
    }
  }, [router]);

  const fetchPoliceProfile = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authority/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          router.push('/police/login');
        } else if (response.status === 404) {
          setProfileUpdateError('User not found. Please ensure your account exists.');
        } else {
          setProfileUpdateError(`Failed to load profile: ${errorData}`);
        }
        throw new Error('Failed to fetch police profile');
      }

      const data: PoliceProfile = await response.json();
      setProfile({
        ...data,
        password: '********',
      });
      setEditableProfile({
        ...data,
        password: '********',
      });
      setLoading(false);
    } catch (error) {
      setProfileUpdateError('Failed to load profile. Please check your network or login again.');
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setProfileUpdateError('');
    setProfileUpdateSuccess('');
  };

  const handleSaveProfile = async () => {
    setProfileUpdateError('');
    setProfileUpdateSuccess('');

    if (!/^[a-zA-Z\s]+$/.test(editableProfile.name)) {
      setProfileUpdateError('Name can only contain letters and spaces.');
      return;
    }

    if (!/^\d{10}$/.test(editableProfile.phoneNumber)) {
      setProfileUpdateError('Phone number must be exactly 10 digits.');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/police/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authority/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editableProfile.name,
          phoneNumber: editableProfile.phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          router.push('/police/login');
        }
        setProfileUpdateError(data.message || 'Failed to update profile');
        return;
      }

      setProfile({
        ...data,
        password: '********',
        stationId: profile.stationId,
        stationName: profile.stationName,
        station: profile.station,
      });
      setEditableProfile({
        ...data,
        password: '********',
        stationId: profile.stationId,
        stationName: profile.stationName,
        station: profile.station,
      });
      setIsEditingProfile(false);
      setProfileUpdateSuccess('Profile updated successfully!');
    } catch (error) {
      setProfileUpdateError('Failed to update profile. Please try again.');
    }
  };

  const handleCancelEditProfile = () => {
    setEditableProfile({ ...profile });
    setIsEditingProfile(false);
    setProfileUpdateError('');
    setProfileUpdateSuccess('');
  };

  const handleChangeEditableProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      if (/^[a-zA-Z\s]*$/.test(value) || value === '') {
        setEditableProfile({ ...editableProfile, [name]: value });
      }
    } else if (name === 'phoneNumber') {
      if (/^\d*$/.test(value) && value.length <= 10) {
        setEditableProfile({ ...editableProfile, [name]: value });
      }
    } else {
      setEditableProfile({ ...editableProfile, [name]: value });
    }
  };

  const handlePasswordChange = async () => {
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordChangeError('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError('New password and confirm password do not match.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordChangeError(
        'New password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
      );
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/police/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authority/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          router.push('/police/login');
        }
        setPasswordChangeError(data.message || 'Failed to change password. Please try again.');
        return;
      }

      setPasswordChangeSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordChangeError('An unexpected error occurred. Please try again.');
    }
  };

  const profileDisplayFields = [
    { key: 'name', label: 'Name', editable: true },
    { key: 'email', label: 'Email', editable: false },
    { key: 'phoneNumber', label: 'Phone Number', editable: true },
    { key: 'role', label: 'Role', editable: false },
    { key: 'stationName', label: 'Assigned Station', editable: false },
    { key: 'createdAt', label: 'Created At', editable: false },
    { key: 'updatedAt', label: 'Last Updated', editable: false },
  ];

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

          <div className="pt-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl transition-colors duration-300 dark:bg-gray-800 dark:bg-opacity-60 light:border-gray-300 light:bg-white light:bg-opacity-80"
            >
              <div className="border-b border-gray-700 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 light:border-gray-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-100 light:text-gray-800">
                    👮 Officer Information
                  </h3>
                  <p className="text-sm text-gray-400 mt-2 light:text-gray-600">
                    You can update your name and phone number for security reasons.
                  </p>
                </div>
                {!isEditingProfile && !loading && (
                  <Button
                    onClick={handleEditProfile}
                    className="bg-gradient-to-r from-[#C3B091] to-[#8B7B5A] hover:from-[#8B7B5A] hover:to-[#7A6A49] text-white font-medium py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 light:from-[#8B7B5A] light:to-[#7A6A49] light:hover:from-[#7A6A49] light:hover:to-[#6A5A39]"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
              <div className="p-6">
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                    className="h-40 w-full rounded-lg bg-gray-600/50 flex items-center justify-center text-gray-400 light:bg-gray-200/50 light:text-gray-600"
                  >
                    Loading profile...
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {profileUpdateError && (
                      <div className="bg-red-900 text-red-200 p-4 rounded-lg border border-red-700 font-medium light:bg-red-100 light:text-red-700 light:border-red-300">
                        {profileUpdateError}
                      </div>
                    )}
                    {profileUpdateSuccess && (
                      <div className="bg-green-900 text-green-200 p-4 rounded-lg border border-green-700 font-medium light:bg-green-100 light:text-green-700 light:border-green-300">
                        {profileUpdateSuccess}
                      </div>
                    )}
                    {profileDisplayFields.map((field) => (
                      <div
                        key={field.key}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center py-2"
                      >
                        <label className="text-base font-medium text-gray-400 light:text-gray-600">
                          {field.label}:
                        </label>
                        {isEditingProfile && field.editable ? (
                          <div className="col-span-2">
                            <input
                              type={field.key === 'phoneNumber' ? 'tel' : 'text'}
                              name={field.key}
                              value={editableProfile[field.key as keyof PoliceProfile] || ''}
                              onChange={handleChangeEditableProfile}
                              className="w-full rounded-md border border-gray-600 bg-gray-700 text-white text-base py-3 px-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C3B091] light:border-gray-300 light:bg-gray-100 light:text-gray-900 light:placeholder-gray-500"
                              placeholder={`Enter your ${field.label.toLowerCase()}`}
                            />
                            {field.key === 'phoneNumber' && (
                              <p className="text-xs text-gray-500 mt-1 light:text-gray-600">
                                Must be 10 digits without any symbols or spaces
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="col-span-2 text-base font-medium break-words text-gray-100 py-3 light:text-gray-900">
                            {field.key === 'stationName' && !profile[field.key as keyof PoliceProfile]
                              ? 'Not Assigned'
                              : profile[field.key as keyof PoliceProfile] || 'Not Available'}
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Station Details Section */}
                    {profile.station && (
                      <div className="mt-6 pt-6 border-t border-gray-700 light:border-gray-300">
                        <h4 className="text-lg font-semibold text-gray-100 mb-4 light:text-gray-800">
                          🏢 Station Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-400 light:text-gray-600">
                              Station Name
                            </label>
                            <p className="text-gray-100 light:text-gray-900">{profile.station.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-400 light:text-gray-600">
                              Address
                            </label>
                            <p className="text-gray-100 light:text-gray-900">{profile.station.address}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {isEditingProfile && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-end space-x-4 pt-6"
                      >
                        <Button
                          onClick={handleCancelEditProfile}
                          className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-semibold py-3 px-8 rounded-lg transform hover:scale-105 transition-all duration-300 light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          className="bg-gradient-to-r from-[#C3B091] to-[#8B7B5A] hover:from-[#8B7B5A] hover:to-[#7A6A49] text-white font-semibold py-3 px-8 rounded-lg transform hover:scale-105 transition-all duration-300 light:from-[#8B7B5A] light:to-[#7A6A49] light:hover:from-[#7A6A49] light:hover:to-[#6A5A39]"
                        >
                          Save Changes
                        </Button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-12 rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl transition-colors duration-300 dark:bg-gray-800 dark:bg-opacity-60 light:border-gray-300 light:bg-white light:bg-opacity-80"
          >
            <div className="border-b border-gray-700 p-6 light:border-gray-200">
              <h3 className="text-xl font-bold text-gray-100 light:text-gray-800">
                🔒 Change Password
              </h3>
              <p className="text-sm text-gray-400 mt-2 light:text-gray-600">
                Ensure your new password meets security requirements
              </p>
            </div>
            <div className="p-6 space-y-6">
              {passwordChangeError && (
                <div className="bg-red-900 text-red-200 p-4 rounded-lg border border-red-700 font-medium light:bg-red-100 light:text-red-700 light:border-red-300">
                  {passwordChangeError}
                </div>
              )}
              {passwordChangeSuccess && (
                <div className="bg-green-900 text-green-200 p-4 rounded-lg border border-green-700 font-medium light:bg-green-100 light:text-green-700 light:border-green-300">
                  {passwordChangeSuccess}
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center"
              >
                <label className="text-base font-medium text-gray-400 light:text-gray-600">
                  Current Password:
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="col-span-2 rounded-md border border-gray-600 bg-gray-700 text-white text-base py-3 px-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C3B091] light:border-gray-300 light:bg-gray-100 light:text-gray-900 light:placeholder-gray-500"
                  placeholder="Enter current password"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center"
              >
                <label className="text-base font-medium text-gray-400 light:text-gray-600">
                  New Password:
                </label>
                <div className="col-span-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-md border border-gray-600 bg-gray-700 text-white text-base py-3 px-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C3B091] light:border-gray-300 light:bg-gray-100 light:text-gray-900 light:placeholder-gray-500"
                    placeholder="Create a strong password"
                  />
                  <p className="text-xs text-gray-500 mt-2 light:text-gray-600">
                    Must include uppercase, lowercase, number, and special character (min 8 chars)
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center"
              >
                <label className="text-base font-medium text-gray-400 light:text-gray-600">
                  Confirm Password:
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="col-span-2 rounded-md border border-gray-600 bg-gray-700 text-white text-base py-3 px-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C3B091] light:border-gray-300 light:bg-gray-100 light:text-gray-900 light:placeholder-gray-500"
                  placeholder="Re-enter your new password"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="flex justify-end pt-6"
              >
                <Button
                  onClick={handlePasswordChange}
                  className="bg-gradient-to-r from-[#C3B091] to-[#8B7B5A] hover:from-[#8B7B5A] hover:to-[#7A6A49] text-white font-semibold py-3 px-8 rounded-lg transform hover:scale-105 transition-all duration-300 light:from-[#8B7B5A] light:to-[#7A6A49] light:hover:from-[#7A6A49] light:hover:to-[#6A5A39]"
                >
                  Change Password
                </Button>
              </motion.div>
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