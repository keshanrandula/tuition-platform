import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePayment } from '../../context/PaymentContext';
import api from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { CreditCard, ArrowLeft, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';

const PaymentPage = () => {
  const { itemType, itemId } = useParams();
  const navigate = useNavigate();
  const { initiateCheckout, verifyPayment } = usePayment();

  // Item states
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [formError, setFormError] = useState('');
  const [activeMethod, setActiveMethod] = useState('card');
  const [slipFile, setSlipFile] = useState(null);

  // Payment processing status
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        if (itemType === 'week') {
          const res = await api.get('/videos/weeks');
          const found = res.data.weeks.find((w) => w._id === itemId);
          if (found) setItem({ title: `Week ${found.weekNumber}: ${found.title}`, description: found.description, price: found.price });
        } else if (itemType === 'videoSet') {
          const res = await api.get('/videos/sets');
          const found = res.data.videoSets.find((s) => s._id === itemId);
          if (found) setItem({ title: found.title, description: found.description, price: found.price });
        }
      } catch (err) {
        console.error('Error fetching checkout item:', err);
        setError('Failed to retrieve product billing details.');
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [itemType, itemId]);

  const handleCardNumberChange = (e) => {
    const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(v);
    }
    setFormError('');
  };

  const handleExpiryChange = (e) => {
    const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      setCardExpiry(`${v.slice(0, 2)}/${v.slice(2, 4)}`);
    } else {
      setCardExpiry(v);
    }
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !cardExpiry || !cardCvc) {
      setFormError('Please complete all billing fields.');
      return;
    }

    if (cardNumber.replace(/\s/g, '').length < 16) {
      setFormError('Please enter a valid 16-digit card number.');
      return;
    }

    setProcessing(true);
    
    setProcessingStep('Initializing secure connection...');
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    setProcessingStep('Authorizing billing ledger...');
    const checkoutRes = await initiateCheckout(itemId, itemType);
    
    if (!checkoutRes.success) {
      setFormError(checkoutRes.message);
      setProcessing(false);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setProcessingStep('Verifying Visa security gates...');
    
    await new Promise((resolve) => setTimeout(resolve, 800));
    setProcessingStep('Finalizing transaction logs...');
    
    const verifyRes = await verifyPayment(checkoutRes.payment.transactionId, 'completed');
    if (verifyRes.success) {
      navigate('/payment-success', {
        state: {
          transactionId: checkoutRes.payment.transactionId,
          amount: checkoutRes.payment.amount,
          title: item.title,
        },
      });
    } else {
      setFormError('Transaction declined by issuer bank.');
      setProcessing(false);
    }
  };

  const handleSlipSubmit = async (e) => {
    e.preventDefault();
    if (!slipFile) {
      setFormError('Please select a deposit receipt file.');
      return;
    }

    setProcessing(true);
    setProcessingStep('Uploading bank deposit slip...');

    try {
      const formData = new FormData();
      formData.append('itemId', itemId);
      formData.append('itemType', itemType);
      formData.append('file', slipFile);

      const res = await api.post('/payments/bank-slip', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setProcessingStep('Finalizing billing request...');
        await new Promise((resolve) => setTimeout(resolve, 800));
        navigate('/payment-success', {
          state: {
            transactionId: res.data.payment.transactionId,
            amount: res.data.payment.amount,
            title: item.title,
            isBankSlip: true
          },
        });
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to upload bank deposit receipt.');
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto mt-20 px-4 bg-white text-slate-800">
        <div className="glass-panel p-8 text-center rounded-2xl border-red-200 space-y-6 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Item Error</h2>
          <p className="text-sm text-slate-500">{error || 'This billing package does not exist.'}</p>
          <div className="pt-4">
            <Link to="/dashboard" className="btn-primary w-full py-2.5 flex items-center justify-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-8 bg-white text-slate-800">
      {/* Back button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Checkout Purchase</h1>
      </div>

      {processing ? (
        <div className="glass-panel max-w-md mx-auto p-10 rounded-2xl border-brand-500/20 text-center space-y-6 animate-pulse-subtle bg-white shadow-md">
          <div className="w-16 h-16 rounded-full border-4 border-brand-500/30 border-t-brand-500 animate-spin mx-auto"></div>
          <h3 className="text-lg font-bold text-slate-900">Processing Transaction</h3>
          <p className="text-xs text-brand-500 font-mono tracking-wider uppercase">{processingStep}</p>
          <p className="text-xs text-slate-400">Do not refresh this browser screen or hit back controls.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border-slate-100 shadow-sm space-y-6 bg-white">
              {/* Payment Methods Tab */}
              <div className="flex border-b border-slate-100 pb-3 gap-6">
                <button
                  type="button"
                  onClick={() => { setActiveMethod('card'); setFormError(''); }}
                  className={`pb-2.5 text-sm font-bold text-center border-b-2 transition-all flex items-center space-x-1.5 ${
                    activeMethod === 'card' 
                      ? 'border-brand-500 text-brand-500' 
                      : 'border-transparent text-slate-400 hover:text-slate-655'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Online Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveMethod('bank'); setFormError(''); }}
                  className={`pb-2.5 text-sm font-bold text-center border-b-2 transition-all flex items-center space-x-1.5 ${
                    activeMethod === 'bank' 
                      ? 'border-brand-500 text-brand-500' 
                      : 'border-transparent text-slate-400 hover:text-slate-655'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Bank Deposit / Slip Upload</span>
                </button>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-start space-x-2 text-sm text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {activeMethod === 'card' ? (
                <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => { setCardName(e.target.value); setFormError(''); }}
                      placeholder="Jane Doe"
                      className="glass-input w-full"
                    />
                  </div>

                  {/* Card Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      maxLength="19"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4000 1234 5678 9010"
                      className="glass-input w-full font-mono"
                    />
                  </div>

                  {/* Expiry and CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        maxLength="5"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        className="glass-input w-full font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength="3"
                        value={cardCvc}
                        onChange={(e) => { setCardCvc(e.target.value.replace(/[^0-9]/g, '')); setFormError(''); }}
                        placeholder="•••"
                        className="glass-input w-full font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full btn-primary py-3 flex items-center justify-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-white" />
                      <span>Authorize Payment of ${item.price.toFixed(2)} USD</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  {/* Bank account details card */}
                  <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl text-xs text-slate-600 leading-normal space-y-3">
                    <h4 className="font-bold text-slate-750 uppercase tracking-wider text-[10px] block">Lanka Tuition Bank Account Details</h4>
                    <p>Transfer the total amount to the account below and upload a clear picture or PDF of your deposit slip/receipt.</p>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-400 block font-bold uppercase text-[9px]">Bank Name</span>
                        <span className="text-slate-800 font-bold">Commercial Bank of Ceylon</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold uppercase text-[9px]">Account Number</span>
                        <span className="text-slate-800 font-bold">8002 9384 2011 4001</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold uppercase text-[9px]">Branch Name</span>
                        <span className="text-slate-800 font-bold">Colombo Fort Branch</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold uppercase text-[9px]">Account Name</span>
                        <span className="text-slate-800 font-bold">EduLanka Tuition Platform</span>
                      </div>
                    </div>
                  </div>

                  {/* Upload Form */}
                  <form onSubmit={handleSlipSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Upload Deposit Slip (JPEG, PNG, or PDF)
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => { setSlipFile(e.target.files[0]); setFormError(''); }}
                        className="file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 glass-input w-full py-1.5 text-xs"
                      />
                    </div>

                    <div className="pt-4">
                      <button type="submit" className="w-full btn-primary py-3 flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 border-brand-500">
                        <span>Submit Deposit Receipt Slip</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Item Sidebar */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border-slate-100 shadow-sm space-y-6 bg-white">
              <h3 className="text-md font-bold text-slate-900 border-b border-slate-100 pb-3">
                Order Summary
              </h3>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest block">
                  Product description
                </span>
                <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
              </div>

              <hr className="border-slate-100" />

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Transaction Fee:</span>
                <span className="font-semibold text-slate-900 font-mono">$0.00</span>
              </div>

              <div className="flex justify-between items-center text-md border-t border-slate-100 pt-4">
                <span className="font-bold text-slate-800">Total Amount:</span>
                <span className="font-bold text-brand-500 font-mono">${item.price.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-slate-100 flex items-start space-x-3 text-xs text-slate-400 bg-white">
              <ShieldCheck className="w-5 h-5 text-brand-500 flex-shrink-0" />
              <span>
                Secured Sandbox Checkout. Any credit card details will pass simulated check gates successfully.
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default PaymentPage;
