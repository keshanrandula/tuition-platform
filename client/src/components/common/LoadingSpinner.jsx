import React from 'react';

const LoadingSpinner = ({ fullScreen = true }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullScreen ? 'min-h-[70vh] w-full' : 'p-6'
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="w-14 h-14 rounded-full border-t-2 border-indigo-500 border-r-2 border-transparent animate-spin"></div>
        {/* Inner reverse spin ring */}
        <div className="absolute w-9 h-9 rounded-full border-b-2 border-purple-500 border-l-2 border-transparent animate-spin [animation-direction:reverse]"></div>
        {/* Center pulsing core */}
        <div className="absolute w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 animate-pulse"></div>
      </div>
      <p className="mt-4 text-xs font-semibold text-indigo-400/80 tracking-widest uppercase animate-pulse">
        Loading Assets...
      </p>
    </div>
  );
};

export default LoadingSpinner;
