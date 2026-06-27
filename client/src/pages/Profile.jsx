import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Key, CreditCard, Award, CheckCircle, AlertCircle, Phone } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, loading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    idNumber: user?.idNumber || '',
    phoneNumber: user?.phoneNumber || '',
    password: '',
    confirmPassword: '',
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, idNumber, phoneNumber, password, confirmPassword } = formData;

    if (!name || !email || !idNumber || !phoneNumber) {
      setValidationError('Name, email, ID number and Phone number are required fields');
      return;
    }

    if (password) {
      if (password.length < 6) {
        setValidationError('New password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match');
        return;
      }
    }

    const result = await updateProfile(name, email, password || null, idNumber, phoneNumber);
    if (result.success) {
      setSuccessMsg('Profile records updated successfully!');
      setFormData({
        ...formData,
        password: '',
        confirmPassword: '',
      });
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
        Account <span className="text-brand-500">Settings</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Edit Profile */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border-slate-100 shadow-md bg-white">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
              <User className="w-5 h-5 text-brand-500" />
              <span>Personal Information</span>
            </h2>

            {/* Notifications */}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-start space-x-2 text-sm text-emerald-700 mb-6 animate-slide-up">
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}
            {(error || validationError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-start space-x-2 text-sm text-red-700 mb-6 animate-slide-up">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{validationError || error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="glass-input !pl-10 w-full"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="glass-input !pl-10 w-full"
                    />
                  </div>
                </div>

                {/* ID Number */}
                <div>
                  <label htmlFor="idNumber" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    ID Card Number (NIC)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="idNumber"
                      name="idNumber"
                      type="text"
                      value={formData.idNumber}
                      onChange={handleChange}
                      className="glass-input !pl-10 w-full"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="text"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="glass-input !pl-10 w-full"
                    />
                  </div>
                </div>

              </div>

              <hr className="border-slate-100 dark:border-slate-700" />

              <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center space-x-2">
                <Key className="w-4 h-4 text-brand-500" />
                <span>Change Password (Optional)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* New Password */}
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Leave blank to keep current"
                      className="glass-input !pl-10 w-full"
                    />
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Leave blank to keep current"
                      className="glass-input !pl-10 w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary py-2.5 px-6 flex items-center justify-center space-x-2"
                >
                  {loading && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>}
                  <span>Save Profile Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Subscriptions & Info */}
        <div className="space-y-8">
          {/* Card: Account details overview */}
          <div className="glass-panel rounded-2xl p-6 border-slate-100 shadow-md text-center relative overflow-hidden bg-white dark:bg-slate-800">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-500/5 to-transparent rounded-bl-full"></div>
            
            <div className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center text-xl font-bold text-white uppercase border-2 border-brand-100 mx-auto mb-4">
              {user.name[0]}
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{user.email}</p>
            {user.idNumber && <p className="text-xs text-slate-400 mb-1 font-medium">NIC: {user.idNumber}</p>}
            {user.phoneNumber && <p className="text-xs text-slate-400 mb-3 font-medium">Phone: {user.phoneNumber}</p>}
            
            <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-brand-50 text-brand-500 border border-brand-100`}>
              {user.role} Account
            </span>
          </div>

          {/* Card: Active Access Logs */}
          {user.role !== 'admin' && (
            <div className="glass-panel rounded-2xl p-6 border-slate-100 shadow-md bg-white">
              <h3 className="text-md font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                <CreditCard className="w-4 h-4 text-brand-500" />
                <span>My Active Course Licenses</span>
              </h3>
              
              <div className="space-y-4">
                {/* Weekly Content Access List */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Unlocked Weekly Modules</h4>
                  {user.purchasedWeeks && user.purchasedWeeks.length > 0 ? (
                    <div className="space-y-2">
                      {user.purchasedWeeks.map((weekId) => (
                        <div key={weekId} className="flex items-center space-x-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="truncate">Week ID: {weekId.slice(-6).toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No paid weekly content unlocked yet.</p>
                  )}
                </div>

                <hr className="border-slate-100" />

                {/* Standalone Video Sets Access List */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Unlocked Subject Packages</h4>
                  {user.purchasedVideoSets && user.purchasedVideoSets.length > 0 ? (
                    <div className="space-y-2">
                      {user.purchasedVideoSets.map((setId) => (
                        <div key={setId} className="flex items-center space-x-2 text-sm text-brand-700 bg-brand-50 px-3 py-2 rounded-lg border border-brand-100">
                          <Award className="w-4 h-4 text-brand-500 flex-shrink-0" />
                          <span className="truncate">Package ID: {setId.slice(-6).toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No standalone video packages unlocked yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
