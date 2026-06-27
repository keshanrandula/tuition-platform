import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, BookOpen, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setValidationError('Please fill in all credentials');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-panel rounded-2xl p-8 border-brand-500/20 shadow-2xl relative overflow-hidden">
        
        {/* Decorative corner glows */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl"></div>

        <div className="text-center relative">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/35">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome <span className="text-gradient-primary">Back</span>
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to access live lectures and learning library
          </p>
        </div>

        {/* Form Alerts */}
        {(error || validationError) && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3.5 flex items-start space-x-2 text-sm text-red-300 animate-slide-up">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
            <span>{validationError || error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="glass-input !pl-10 w-full"
                  placeholder="student@tuition.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="glass-input !pl-10 pr-10 w-full"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-brand-500"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 text-sm text-slate-500 font-medium">
          New to TuitionHub?{' '}
          <Link to="/register" className="text-brand-500 hover:text-brand-600 font-semibold underline underline-offset-4">
            Create an account
          </Link>
        </div>

        {/* Demo Accounts Panel */}
        <div className="mt-8 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <p className="font-semibold text-center mb-2">Demo Credentials for Evaluation:</p>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-brand-50/40 p-2 rounded border border-brand-100/50">
              <p className="font-semibold text-brand-700">Student Account</p>
              <p className="text-slate-600">student@tuition.com</p>
              <p className="font-mono text-slate-800">student123</p>
            </div>
            <div className="bg-brand-50/40 p-2 rounded border border-brand-100/50">
              <p className="font-semibold text-brand-700">Admin Account</p>
              <p className="text-slate-600">admin@tuition.com</p>
              <p className="font-mono text-slate-800">admin123</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
