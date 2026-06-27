import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BookOpen, Video, Calendar, User, LogOut, Menu, X, Shield, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    ...(user
      ? [
          { name: 'Live Class', path: '/live-classes', icon: Calendar },
          { name: 'Videos', path: '/video-library', icon: Video },
          ...(user.role === 'admin'
            ? [{ name: 'Admin Dashboard', path: '/admin', icon: Shield }]
            : [{ name: 'Dashboard', path: '/dashboard', icon: BookOpen }]),
        ]
      : [
          { name: 'Live Class', path: '/register', icon: Calendar },
          { name: 'Videos', path: '/register', icon: Video },
        ]),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700/60 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="text-xl font-extrabold font-sans tracking-wide text-brand-500 hover:text-brand-600 transition-colors">
                Edu<span className="text-slate-800 dark:text-white font-extrabold">Lanka</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-1 py-2 text-sm font-semibold transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-brand-500 border-b-2 border-brand-500'
                    : 'text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400'
                }`}
              >
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Auth Actions / Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            <button
              id="dark-mode-toggle-desktop"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-yellow-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 group"
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 w-[18px] h-[18px] transition-transform duration-300 group-hover:rotate-45" />
              ) : (
                <Moon className="w-[18px] h-[18px] transition-transform duration-300 group-hover:-rotate-12" />
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-brand-500 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-white uppercase border border-brand-100">
                    {user.name[0]}
                  </div>
                  <span className="font-semibold">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-slate-500 dark:text-slate-400 hover:text-brand-500 text-sm font-semibold transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-5 rounded-lg text-sm transition-all shadow-md shadow-brand-500/10"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Dark mode toggle + Menu Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              id="dark-mode-toggle-mobile"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-yellow-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-brand-500 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 animate-fade-in shadow-lg transition-colors duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-3 rounded-lg text-base font-semibold transition-all ${
                  isActive(link.path)
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-500'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-brand-500'
                }`}
              >
                <span>{link.name}</span>
              </Link>
            ))}

            {user ? (
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4 pb-2 mt-4">
                <div className="flex items-center px-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-sm font-bold text-white uppercase">
                    {user.name[0]}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-semibold text-slate-800 dark:text-slate-100">{user.name}</div>
                    <div className="text-sm font-semibold text-slate-400 dark:text-slate-500">{user.email}</div>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 w-full px-3 py-3 rounded-lg text-base font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <User className="w-5 h-5" />
                  <span>View Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-3 rounded-lg text-base font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-4 px-3 flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-slate-600 dark:text-slate-300 hover:text-brand-500 py-2.5 rounded-lg text-base font-semibold hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-center py-2.5 rounded-lg text-base shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
