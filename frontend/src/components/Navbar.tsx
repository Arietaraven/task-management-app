import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CheckSquare, User as UserIcon, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = (path: string) =>
    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
      location.pathname === path
        ? 'bg-indigo-700 text-white'
        : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
    }`;

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <span className="font-bold text-xl tracking-tight">TaskManager</span>
            <div className="flex space-x-4">
              <Link to="/dashboard" className={navClass('/dashboard')}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link to="/tasks" className={navClass('/tasks')}>
                <CheckSquare className="w-4 h-4" />
                <span>Tasks</span>
              </Link>
              <Link to="/profile" className={navClass('/profile')}>
                <UserIcon className="w-4 h-4" />
                <span>Profile</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium hidden sm:inline">
              Welcome, {user?.firstName}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-indigo-700 hover:bg-indigo-800 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};