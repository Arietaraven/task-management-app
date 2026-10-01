import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { User, Mail, ShieldCheck, Key, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const Profile = () => {
  // Main Profile State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Password Change State
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '' });
  const [passMessage, setPassMessage] = useState('');
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        setFormData(res.data);
      } catch (err: unknown) {
        const errorResponse = err as ApiError;
        setError(errorResponse.response?.data?.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await api.put('/users/profile', formData);
      setMessage(res.data.message || 'Profile updated successfully!');
    } catch (err: unknown) {
      const errorResponse = err as ApiError;
      setError(errorResponse.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage('');
    setPassError('');
    setPassLoading(true);

    try {
      const res = await api.put('/users/change-password', passData);
      setPassMessage(res.data.message || 'Password changed successfully!');
      setPassData({ currentPassword: '', newPassword: '' });
    } catch (err: unknown) {
      const errorResponse = err as ApiError;
      setPassError(errorResponse.response?.data?.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500 font-medium">Loading profile details...</div>;

  const userInitials = `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 bg-indigo-600 text-white font-extrabold text-2xl rounded-full flex items-center justify-center shadow-md shrink-0">
          {userInitials}
        </div>
        <div className="text-center md:text-left space-y-1">
          <h1 className="text-2xl font-bold text-gray-800">
            {formData.firstName} {formData.lastName}
          </h1>
          <p className="text-sm text-gray-500 font-medium">@{formData.username} • {formData.email}</p>
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Active Account</span>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Personal Details Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-4 mb-6">
              <User className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-800">Personal Information</h2>
            </div>

            {message && (
              <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}
            {error && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">First Name</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm">@</span>
                  <input
                    type="text"
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-50">
            <button
              type="submit"
              form="profile-form"
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
            >
              Save Profile Changes
            </button>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-4 mb-6">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-800">Security & Password</h2>
            </div>

            {passMessage && (
              <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passMessage}</span>
              </div>
            )}
            {passError && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <form id="password-form" onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Current Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={passData.currentPassword}
                    onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">New Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={passData.newPassword}
                    onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-50">
            <button
              type="submit"
              form="password-form"
              disabled={passLoading}
              className="w-full bg-gray-800 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-900 transition shadow-sm disabled:opacity-50"
            >
              {passLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};