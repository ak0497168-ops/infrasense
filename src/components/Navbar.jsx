import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  FileText,
  BarChart3,
  Bell,
  User,
  HelpCircle,
  Menu,
  X,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { notificationsAPI } from '../services/api.js';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      notificationsAPI.getAll()
        .then((res) => {
          if (res.data?.data?.unreadCount !== undefined) {
            setUnreadCount(res.data.data.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const isAdmin = user?.role === 'ADMIN';

  // Role-specific navigation:
  // - Citizens do NOT see "Infrastructure Insights" (insights are restricted to Admin)
  // - Admins do NOT see "Report Issue" or "My Reports" (Admins manage reports in Dashboard)
  const navItems = isAdmin
    ? [
        { name: 'Dashboard', path: '/admin/dashboard', icon: ShieldCheck },
        { name: 'Home', path: '/home', icon: Home },
        { name: 'Notifications', path: '/admin/notifications', icon: Bell, badge: unreadCount },
        { name: 'Help & Support', path: '/help', icon: HelpCircle },
      ]
    : [
        { name: 'Home', path: '/home', icon: Home },
        { name: 'Report Issue', path: '/report', icon: PlusCircle },
        { name: 'My Reports', path: '/reports', icon: FileText },
        { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
        { name: 'Help & Support', path: '/help', icon: HelpCircle },
      ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Wordmark */}
          <Link to={isAuthenticated ? '/home' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-sky-900 text-white flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
              <ShieldCheck className="w-5 h-5 text-sky-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                InfraSense
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 mt-0.5">
                Civic Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-slate-100 text-sky-900 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {item.badge > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-600 text-white leading-none">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          )}

          {/* User Profile & Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-800 hover:bg-sky-900 border border-sky-700 rounded-lg shadow-sm transition-all whitespace-nowrap"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-200" />
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/report"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-lg shadow-sm transition-all whitespace-nowrap"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-sky-200" />
                    Report Issue
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
                  title="Citizen Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs border border-slate-300">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-medium max-w-[100px] truncate">
                    {user?.name?.split(' ')[0] || 'Profile'}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/admin/login"
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Admin Portal
                </Link>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-lg shadow-sm transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            {isAuthenticated && unreadCount > 0 && (
              <Link to="/notifications" className="relative p-2 text-slate-600">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-600 rounded-full" />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top duration-200">
          {isAuthenticated ? (
            <>
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{user?.name}</div>
                    <div className="text-xs text-slate-500">{user?.email}</div>
                  </div>
                </div>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg ${
                        isActive
                          ? 'bg-sky-50 text-sky-900 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-600 text-white">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}

              <NavLink
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>My Profile</span>
              </NavLink>

              <div className="pt-3 border-t border-slate-100 mt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-sky-800 rounded-lg"
              >
                Register as Citizen
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
