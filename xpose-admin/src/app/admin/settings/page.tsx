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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/authority/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          router.push('/admin/login');
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
      console.error('Error fetching admin profile:', error);
      setProfileUpdateError('Failed to load profile. Please try again.');
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/authority/update-profile`, {
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
      console.error('Error saving profile:', error);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/authority/update-password`, {
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
      console.error('Error changing password:', error);
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen">
      <Sidebar />

      <main className="ml-0 p-4 transition-all duration-300 md:ml-[80px] md:p-8 lg:ml-[260px] bg-transparent">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mx-auto max-w-7xl"
        >
          <AdminHeader title="Admin Settings" />

          <div className="pt-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-lg dark:bg-gray-800 dark:bg-opacity-60 light:border-gray-300 light:bg-white light:bg-opacity-80"
            >
              <div className="border-b border-gray-700 p-5 flex justify-between items-center dark:border-gray-700 light:border-gray-200">
                <h3 className="text-xl font-semibold text-blue-400 dark:text-blue-400 light:text-blue-600">Profile Information</h3>
                {!isEditingProfile && !loading && (
                  <Button
                    onClick={handleEditProfile}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2 px-5 rounded-lg shadow-md"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
              <div className="p-5">
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                    className="h-40 w-full rounded-lg bg-gray-700/50 dark:bg-gray-700/50 light:bg-gray-200"
                  ></motion.div>
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
                      <div className="text-red-500 text-sm mb-2">{profileUpdateError}</div>
                    )}
                    {profileUpdateSuccess && (
                      <div className="text-green-500 text-sm mb-2">{profileUpdateSuccess}</div>
                    )}
                    {profileDisplayFields.map((field) => (
                      <motion.div
                        key={field.key}
                        variants={itemVariants}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center py-1.5"
                      >
                        <label className="text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700">
                          {field.label}:
                        </label>
                        {isEditingProfile && field.editable ? (
                          <input
                            type={field.key === 'phoneNumber' ? 'tel' : 'text'}
                            name={field.key}
                            value={editableProfile[field.key as keyof AdminProfile] || ''}
                            onChange={handleChangeEditableProfile}
                            className="col-span-2 rounded-md border border-gray-600 bg-gray-900/50 p-2.5 text-white text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-900/50 light:border-gray-300 light:bg-white light:text-gray-900"
                          />
                        ) : (
                          <span className="col-span-2 text-sm text-gray-200 dark:text-gray-200 light:text-gray-800 break-words">
                            {profile[field.key as keyof AdminProfile]}
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
                          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 px-6 rounded-lg"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-2.5 px-6 rounded-lg"
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
            className="mt-6 rounded-xl border border-gray-700 bg-gray-800 bg-opacity-60 shadow-lg dark:bg-gray-800 dark:bg-opacity-60 light:border-gray-300 light:bg-white light:bg-opacity-80"
          >
            <div className="border-b border-gray-700 p-5 dark:border-gray-700 light:border-gray-200">
              <h3 className="text-xl font-semibold text-blue-400 dark:text-blue-400 light:text-blue-600">Change Password</h3>
            </div>
            <div className="p-5 space-y-4">
              {passwordChangeError && (
                <div className="text-red-500 text-sm mb-2">{passwordChangeError}</div>
              )}
              {passwordChangeSuccess && (
                <div className="text-green-500 text-sm mb-2">{passwordChangeSuccess}</div>
              )}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center py-1.5"
              >
                <label className="text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700">Current Password:</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="col-span-2 rounded-md border border-gray-600 bg-gray-900/50 p-2.5 text-white text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-900/50 light:border-gray-300 light:bg-white light:text-gray-900"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center py-1.5"
              >
                <label className="text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700">New Password:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="col-span-2 rounded-md border border-gray-600 bg-gray-900/50 p-2.5 text-white text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-900/50 light:border-gray-300 light:bg-white light:text-gray-900"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center py-1.5"
              >
                <label className="text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700">Confirm New Password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="col-span-2 rounded-md border border-gray-600 bg-gray-900/50 p-2.5 text-white text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-900/50 light:border-gray-300 light:bg-white light:text-gray-900"
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
                  className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold py-2.5 px-6 rounded-lg"
                >
                  Change Password
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <style jsx global>{`
        html.dark {
          background: linear-gradient(to bottom right, #111827 0%, #4338ca 100%);
          color: white;
        }
        html.light {
          background: linear-gradient(to bottom right, #e0f2fe 0%, #ede9fe 100%);
          color: #1f2937;
        }
        body, main, .sidebar, .header {
          background: transparent;
        }
      `}</style>
    </div>
  );
}