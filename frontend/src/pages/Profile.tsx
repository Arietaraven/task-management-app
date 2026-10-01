import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/profile', formData);
      setUser(res.data);
      setMessage('Profile updated successfully!');
    } catch (err: unknown) {
      const errorResponse = err as ApiError;
      setMessage(errorResponse.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      {message && <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md text-sm">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">First Name</label>
          <input className="w-full border p-2 rounded" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium">Last Name</label>
          <input className="w-full border p-2 rounded" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium">Username</label>
          <input className="w-full border p-2 rounded" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" className="w-full border p-2 rounded" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Update Profile</button>
      </form>
    </div>
  );
};