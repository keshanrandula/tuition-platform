import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Mail } from 'lucide-react';

const PaymentSuccess = () => {
  const location = useLocation();
  const { transactionId, amount, title, isBankSlip } = location.state || {
    transactionId: 'txn_mock_0000000000',
    amount: 0.00,
    title: 'Weekly Syllabus Module',
    isBankSlip: false,
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-white text-slate-800">
      <div className="w-full max-w-lg glass-panel p-8 rounded-2xl border-emerald-200 shadow-xl relative overflow-hidden text-center space-y-6 bg-white">
        
        {/* Glowing background drops */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-emerald-50 rounded-full blur-2xl"></div>

        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-md">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {isBankSlip ? 'Receipt Uploaded!' : 'Payment Confirmed!'}
          </h1>
          <p className="text-sm text-slate-400">
            {isBankSlip 
              ? 'Our administrative team is reviewing your deposit receipt. Content will auto-unlock shortly.'
              : 'Access to your materials has been unlocked successfully.'}
          </p>
        </div>

        {/* Invoice details list */}
        <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl text-left text-sm space-y-3 font-sans">
          <div className="flex justify-between items-center border-b border-slate-200/60 pb-2.5">
            <span className="text-slate-400">Transaction ID:</span>
            <span className="font-mono text-xs text-brand-500 font-semibold">{transactionId}</span>
          </div>
          <div className="flex justify-between items-start border-b border-slate-200/60 pb-2.5">
            <span className="text-slate-400">Purchased Item:</span>
            <span className="text-slate-800 text-right max-w-[200px] truncate font-semibold">{title}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Amount Charged:</span>
            <span className="font-extrabold text-emerald-600 font-mono text-md">${amount.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Email advice */}
        <div className="flex items-center justify-center space-x-2 text-xs text-brand-500 bg-brand-50 border border-brand-100 p-3 rounded-lg">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span>
            {isBankSlip 
              ? 'You will receive an email notification once your transaction is confirmed.'
              : 'A copy of this billing receipt has been sent to your email.'}
          </span>
        </div>

        {/* Call to action buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto btn-primary py-2.5 px-6 flex items-center justify-center space-x-1.5 text-sm"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/video-library"
            className="w-full sm:w-auto btn-secondary py-2.5 px-6 text-sm"
          >
            Browse Study Library
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PaymentSuccess;
