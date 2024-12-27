export const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated circles */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-float-slow"></div>
      <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-white/30 rounded-full animate-float-medium"></div>
      <div className="absolute bottom-1/4 left-1/3 w-8 h-8 bg-white/10 rounded-full animate-float-fast"></div>
      
      {/* Gradient orbs */}
      <div className="absolute -top-1/2 -right-1/2 w-[100rem] h-[100rem] bg-white/5 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-1/2 -left-1/2 w-[100rem] h-[100rem] bg-[#24C6DC]/10 rounded-full blur-3xl animate-pulse-slower"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-32 w-12 h-12 border border-white/20 rounded-lg rotate-45 animate-spin-slow"></div>
      <div className="absolute bottom-32 left-20 w-8 h-8 border border-white/10 rounded-full animate-spin-slower"></div>
      
      {/* Lines */}
      <div className="absolute top-1/4 left-0 w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-width"></div>
      <div className="absolute bottom-1/3 right-0 w-40 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-width delay-200"></div>
    </div>
  );
};
