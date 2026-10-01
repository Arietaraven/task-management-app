import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import type { DashboardStats, Task } from '../types';
import { Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/tasks'),
        ]);
        setStats(statsRes.data);
        // Take the 5 most recent or upcoming tasks
        setRecentTasks(tasksRes.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  const total = stats?.total || 0;
  const completed = stats?.completed || 0;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const cards = [
    { label: 'Total Tasks', value: stats?.total, bg: 'bg-blue-600' },
    { label: 'To Do', value: stats?.toDo, bg: 'bg-amber-500' },
    { label: 'In Progress', value: stats?.inProgress, bg: 'bg-indigo-600' },
    { label: 'Completed', value: stats?.completed, bg: 'bg-emerald-600' },
    { label: 'Overdue', value: stats?.overdue, bg: 'bg-rose-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Summary</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your productivity and upcoming task deadlines.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className={`${card.bg} text-white p-6 rounded-xl shadow-sm transition hover:shadow-md`}>
            <p className="text-xs uppercase tracking-wider font-semibold opacity-90">{card.label}</p>
            <p className="text-4xl font-extrabold mt-2">{card.value ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Overall Progress Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-800">Overall Task Completion Rate</h2>
          <span className="text-sm font-semibold text-indigo-600">{completionPercentage}% Completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Bottom Grid: Recent Tasks & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks List (Spans 2 Columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Tasks</h2>
            <Link to="/tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
              <span>View All</span> <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No tasks found.</p>
              <Link to="/tasks" className="text-indigo-600 font-medium text-sm mt-2 inline-block">
                + Add your first task
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentTasks.map((task) => (
                <div key={task.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {task.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : task.status === 'IN_PROGRESS' ? (
                      <Clock className="w-5 h-5 text-indigo-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{task.title}</p>
                      <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      task.priority === 'HIGH'
                        ? 'bg-rose-100 text-rose-700'
                        : task.priority === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips / Shortcut Panel */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-indigo-900 mb-2">Quick Actions</h2>
            <p className="text-sm text-indigo-700 mb-6">
              Organize your workflow effectively by prioritizing urgent tasks first.
            </p>
          </div>
          <Link
            to="/tasks"
            className="w-full text-center bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm"
          >
            Manage All Tasks
          </Link>
        </div>
      </div>
    </div>
  );
};