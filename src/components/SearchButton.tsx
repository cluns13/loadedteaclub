'use client';

import { useState } from 'react';

interface SearchButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
}

export const SearchButton = ({ onClick, loading, disabled }: SearchButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`group relative w-full bg-white hover:bg-opacity-95 text-[#514A9D] px-8 py-4 rounded-2xl 
                text-lg font-medium transition-all duration-300 
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg hover:shadow-xl overflow-hidden
                transform ${isPressed ? 'scale-[0.98]' : 'scale-100'}`}
    >
      <span className="relative z-10 flex items-center justify-center">
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#24C6DC]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Finding locations...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Find Loaded Tea Near Me
          </>
        )}
      </span>

      {/* Button hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#24C6DC]/20 to-[#514A9D]/20 
                    transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      
      {/* Ripple effect */}
      <div className="absolute inset-0 group-hover:bg-white/20 transition-colors duration-200" />
    </button>
  );
};
