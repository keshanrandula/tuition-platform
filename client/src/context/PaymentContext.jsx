import React, { createContext, useContext, useState } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initiate purchase checkout
  const initiateCheckout = async (itemId, itemType) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/payments/checkout', { itemId, itemType });
      if (response.data.success) {
        return { success: true, payment: response.data.payment };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to initialize payment checkout.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Complete/Verify simulated payment
  const verifyPayment = async (transactionId, status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/payments/verify', { transactionId, status });
      if (response.data.success) {
        // Update user state globally to unlock new items immediately
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Payment verification failed.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check local purchase status
  const hasAccess = (itemId, itemType) => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admins see everything
    
    if (itemType === 'week') {
      return user.purchasedWeeks && user.purchasedWeeks.includes(itemId);
    }
    if (itemType === 'videoSet') {
      return user.purchasedVideoSets && user.purchasedVideoSets.includes(itemId);
    }
    return false;
  };

  return (
    <PaymentContext.Provider
      value={{
        loading,
        error,
        initiateCheckout,
        verifyPayment,
        hasAccess
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => useContext(PaymentContext);
