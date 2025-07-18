'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/admin/ui/button';

interface AdminProfile {
  id: number;
  name: string;
  email: string;
  password?: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [profile, setProfile] = useState<AdminProfile>({
    id: 0,
    name: '',
    email: '',
    phoneNumber: '',
    role: '',
    createdAt: '',
    updatedAt: '',
  });
  const [editableProfile, setEditableProfile] = useState<AdminProfile>({ ...profile });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [profileUpdateError, setProfileUpdateError] = useState('');
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme === 'light' ? 'light' : 'dark');
    } else {
      setTheme('dark');
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/admin/login');
    } else {
      fetchAdminProfile(token);
    }
  }, [router]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const fetchAdminProfile = async (token: string) => {
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
          router.push('/admin/login');
        } else if (response.status === 404) {
          setProfileUpdateError('User not found. Please ensure your account exists.');
        } else {
          setProfileUpdateError(`Failed to load profile: ${errorData}`);
        }
        throw new Error('Failed to fetch admin profile');
      }

      const data: AdminProfile = await response.json();
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
      router.push('/admin/login');
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

      const data: AdminProfile = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          router.push('/admin/login');
        }
        setProfileUpdateError(data.message || 'Failed to update profile');
        return;
      }

      setProfile({
        ...data,
        password: '********',
      });
      setEditableProfile({
        ...data,
        password: '********',
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
        'New password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., Nibin@123).'
      );
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/admin/login');
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
          router.push('/admin/login');
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
    { key: 'createdAt', label: 'Created At', editable: false },
    { key: 'updatedAt', label: 'Last Updated', editable: false },
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
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
          <AdminHeader title="Admin Settings" />

          <div className="pt-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl dark:bg-gray-800 dark:bg-opacity-60 light:border-gray-300 light:bg-white light:bg-opacity-80 dark:hover:border-blue-600 light:hover:border-blue-500"
            >
              <div className="border-b border-gray-700 p-6 flex justify-between items-center dark:border-gray-700 light:border-gray-300">
                <h3 className="text-xl font-bold text-blue-300 light:text-blue-700">Profile Information</h3>
                {!isEditingProfile && !loading && (
                  <Button
                    onClick={handleEditProfile}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2 px-5 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300"
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
                    className="h-40 w-full rounded-lg bg-gray-600/50 dark:bg-gray-600/50 light:bg-gray-200/50 text-center text-gray-400 light:text-gray-600"
                  >
                    <span>Loading...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.07 } },
                    }}
                    className="space-y-4"
                  >
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
                      <motion.div
                        key={field.key}
                        variants={itemVariants}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center py-1.5"
                      >
                        <label className="text-sm font-medium text-gray-400 light:text-gray-600">
                          {field.label}:
                        </label>
                        {isEditingProfile && field.editable ? (
                          <input
                            type={field.key === 'phoneNumber' ? 'tel' : 'text'}
                            name={field.key}
                            value={editableProfile[field.key as keyof AdminProfile] || ''}
                            onChange={handleChangeEditableProfile}
                            className="col-span-2 rounded-md border border-gray-600 bg-gray-700 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 light:border-gray-300 light:bg-gray-100 light:text-gray-900 light:placeholder-gray-500"
                          />
                        ) : (
                          <span className="col-span-2 text-sm font-medium text-blue-200 light:text-gray-800 break-words">
                            {profile[field.key as keyof AdminProfile] || 'Not Available'}
                          </span>
                        )}
                      </motion.div>
                    ))}
                    {isEditingProfile && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-end space-x-3 pt-4"
                      >
                        <Button
                          onClick={handleCancelEditProfile}
                          className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-semibold py-2.5 px-6 rounded-lg transform hover:scale-105 transition-all duration-300 light:bg-gray-200 light:hover:bg-gray-300 light:text-gray-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-2.5 px-6 rounded-lg transform hover:scale-105 transition-all duration-300"
                        >
                          Save Changes
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-12 rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-xl dark:bg-gray-800 dark:bg-opacity-60 light:border-gray-300 light:bg-white light:bg-opacity-80 dark:hover:border-purple-600 light:hover:border-purple-500"
          >
            <div className="border-b border-gray-700 p-6 dark:border-gray-700 light:border-gray-300">
              <h3 className="text-xl font-bold text-blue-300 light:text-blue-700">Change Password</h3>
            </div>
            <div className="p-6 space-y-4">
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
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center py-1.5"
              >
                <label className="text-sm font-medium text-gray-400 light:text-gray-600">Current Password:</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="col-span-2 rounded-md border border-gray-600 bg-gray-700 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 light:border-gray-300 light:bg-gray-100 light:text-gray-900 light:placeholder-gray-500"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center py-1.5"
              >
                <label className="text-sm font-medium text-gray-400 light:text-gray-600">New Password:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="col-span-2 rounded-md border border-gray-600 bg-gray-700 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 light:border-gray-300 light:bg-gray-100 light:text-gray-900 light:placeholder-gray-500"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center py-1.5"
              >
                <label className="text-sm font-medium text-gray-400 light:text-gray-600">Confirm New Password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="col-span-2 rounded-md border border-gray-600 bg-gray-700 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 light:border-gray-300 light:bg-gray-100 light:text-gray-900 light:placeholder-gray-500"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="flex justify-end pt-4"
              >
                <Button
                  onClick={handlePasswordChange}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg transform hover:scale-105 transition-all duration-300"
                >
                  Change Password
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}