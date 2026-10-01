import React, { useState, useEffect } from 'react';
import api from '../api/client';
import type { Task, Status, Priority } from '../types';
import { Plus, Search, Trash2, Edit } from 'lucide-react';

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
    } catch {
      // Handle error
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      setLoading(true);
      try {
        const res = await api.get('/tasks', { params: { search, status, priority } });
        if (isMounted) setTasks(res.data);
      } catch {
        // Handle error
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
    } catch {
      // Handle error
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch {
        // Handle error
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <button onClick={() => handleOpenModal()} className="flex items-center space-x-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> <span>Add Task</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="pl-9 pr-4 py-2 border rounded-md w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="border rounded-md p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="TO_DO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select className="border rounded-md p-2" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div>Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center p-8 bg-white border border-dashed rounded-lg text-gray-500">No tasks found. Create a new task to get started!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white p-4 rounded-lg border shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${task.priority === 'HIGH' ? 'bg-red-100 text-red-700' : task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{task.description}</p>
              </div>
              <div>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  <span className="font-medium text-indigo-600">{task.status}</span>
                </div>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => handleOpenModal(task)} className="p-1 hover:bg-gray-100 rounded text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(task.id)} className="p-1 hover:bg-gray-100 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Title" required className="w-full border p-2 rounded" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <textarea placeholder="Description" className="w-full border p-2 rounded" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <select className="border p-2 rounded" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}>
                  <option value="TO_DO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <select className="border p-2 rounded" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <input type="date" required className="w-full border p-2 rounded" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};