'use client';

import { useEffect, useRef } from 'react';

export const LiquidBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#24C6DC] to-[#514A9D] opacity-100" />
      
      {/* Moving blobs */}
      <div className="absolute top-0 left-0 w-[70vmax] h-[70vmax] rounded-full 
                    bg-gradient-to-br from-[#24C6DC] to-transparent 
                    mix-blend-screen blur-3xl opacity-90
                    animate-blob1-fast" 
      />
      
      <div className="absolute top-0 right-0 w-[65vmax] h-[65vmax] rounded-full 
                    bg-gradient-to-br from-[#514A9D] to-transparent 
                    mix-blend-screen blur-3xl opacity-90
                    animate-blob2-fast"
      />
      
      <div className="absolute bottom-0 left-1/2 w-[60vmax] h-[60vmax] rounded-full 
                    bg-gradient-to-br from-[#ff6b6b] to-transparent 
                    mix-blend-screen blur-3xl opacity-70
                    animate-blob3-fast"
      />

      {/* Floating dots */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white rounded-full opacity-50 animate-float-fast" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white rounded-full opacity-30 animate-float-faster" />
      <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white rounded-full opacity-40 animate-float-fastest" />
    </div>
  );
};
