import React, { useEffect, useState } from 'react';
import api from '../api/client';
import type { DashboardStats } from '../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  const cards = [
    { label: 'Total Tasks', value: stats?.total, bg: 'bg-blue-500' },
    { label: 'To Do', value: stats?.toDo, bg: 'bg-yellow-500' },
    { label: 'In Progress', value: stats?.inProgress, bg: 'bg-indigo-500' },
    { label: 'Completed', value: stats?.completed, bg: 'bg-green-500' },
    { label: 'Overdue', value: stats?.overdue, bg: 'bg-red-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Summary</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className={`${card.bg} text-white p-6 rounded-lg shadow-md`}>
            <p className="text-sm uppercase tracking-wide font-semibold">{card.label}</p>
            <p className="text-4xl font-extrabold mt-2">{card.value ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
};