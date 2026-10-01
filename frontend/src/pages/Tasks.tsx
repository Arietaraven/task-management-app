import React, { useState, useEffect } from 'react';
import api from '../api/client';
import type { Task, Status, Priority } from '../types';
import { Plus, Search, Trash2, Edit, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TO_DO' as Status,
    priority: 'MEDIUM' as Priority,
    dueDate: new Date().toISOString().split('T')[0],
  });

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks', { params: { search, status, priority } });
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      setLoading(true);
      try {
        const res = await api.get('/tasks', { params: { search, status, priority } });
        if (isMounted) setTasks(res.data);
      } catch (err) {
        console.error('Error loading tasks', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [search, status, priority]);

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate.split('T')[0],
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'TO_DO',
        priority: 'MEDIUM',
        dueDate: new Date().toISOString().split('T')[0],
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error('Error saving task', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (err) {
        console.error('Error deleting task', err);
      }
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
  };

  const getStatusBadge = (taskStatus: Status) => {
    switch (taskStatus) {
      case 'COMPLETED':
        return <span className="flex items-center space-x-1 text-emerald-600 font-semibold text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> <span>Completed</span></span>;
      case 'IN_PROGRESS':
        return <span className="flex items-center space-x-1 text-indigo-600 font-semibold text-xs"><Clock className="w-3.5 h-3.5" /> <span>In Progress</span></span>;
      default:
        return <span className="flex items-center space-x-1 text-amber-600 font-semibold text-xs"><AlertCircle className="w-3.5 h-3.5" /> <span>To Do</span></span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Task Management</h1>
          <p className="text-gray-500 text-sm mt-1">Filter, edit, and organize all your personal tasks.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm font-semibold text-sm">
          <Plus className="w-4 h-4" /> <span>Create Task</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or keyword..."
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="TO_DO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="LOW">Low Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="HIGH">High Priority</option>
        </select>
      </div>

      {/* Counter Banner */}
      <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
        <span>Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
        {(search || status || priority) && (
          <button onClick={clearFilters} className="text-indigo-600 hover:underline">
            Reset Filters
          </button>
        )}
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading your tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center p-12 bg-white border border-dashed border-gray-300 rounded-xl text-gray-500">
          <p className="font-semibold text-gray-700">No tasks found</p>
          <p className="text-xs text-gray-400 mt-1">Try resetting your filters or create a new task to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-semibold text-gray-800 text-base">{task.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${task.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{task.description || 'No description provided.'}</p>
              </div>

              <div className="pt-4 border-t border-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                  {getStatusBadge(task.status)}
                </div>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => handleOpenModal(task)} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 hover:text-indigo-600 transition"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(task.id)} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 hover:text-rose-600 transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                <input type="text" placeholder="Task title" required className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea placeholder="Task details..." className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}>
                    <option value="TO_DO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
                  <select className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Due Date</label>
                <input type="date" required className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};