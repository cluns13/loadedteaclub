import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#24C6DC',
        secondary: '#514A9D',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #24C6DC 0%, #514A9D 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #1B9AA8 0%, #3C367A 100%)',
        'gradient-light': 'linear-gradient(135deg, rgba(36, 198, 220, 0.1) 0%, rgba(81, 74, 157, 0.1) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 8s ease-in-out infinite',
        'float-fast': 'float 2s ease-in-out infinite',
        'float-faster': 'float 1.5s ease-in-out infinite',
        'float-fastest': 'float 1s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'pulse-slower': 'pulse 6s ease-in-out infinite',
        'spin-slow': 'spin 4s linear infinite',
        'spin-slower': 'spin 6s linear infinite',
        'width': 'width 2s ease-in-out infinite',
        'border-flow': 'border-flow 1.5s linear infinite',
        'gradient-x': 'gradient-x 7.5s ease infinite',
        'move-1': 'move-1 12.5s ease infinite',
        'move-2': 'move-2 15s ease infinite',
        'move-3': 'move-3 17.5s ease infinite',
        'liquid-1': 'liquid1 4s ease-in-out infinite',
        'liquid-2': 'liquid2 6s ease-in-out infinite',
        'liquid-3': 'liquid3 5s ease-in-out infinite',
        'blob1-fast': 'blob1 12.5s infinite',
        'blob2-fast': 'blob2 15s infinite',
        'blob3-fast': 'blob3 17.5s infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { 
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': { 
            transform: 'translate(10px, -30px) scale(1.1)',
          },
          '66%': { 
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
        },
        width: {
          '0%, 100%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
        },
        'border-flow': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'move-1': {
          '0%, 100%': {
            transform: 'translate(0, 0)',
          },
          '25%': {
            transform: 'translate(50vw, 25vh)',
          },
          '50%': {
            transform: 'translate(0, 50vh)',
          },
          '75%': {
            transform: 'translate(-50vw, 25vh)',
          },
        },
        'move-2': {
          '0%, 100%': {
            transform: 'translate(50vw, 0)',
          },
          '25%': {
            transform: 'translate(0, 35vh)',
          },
          '50%': {
            transform: 'translate(-50vw, 0)',
          },
          '75%': {
            transform: 'translate(0, -35vh)',
          },
        },
        'move-3': {
          '0%, 100%': {
            transform: 'translate(-50vw, -25vh)',
          },
          '25%': {
            transform: 'translate(25vw, 25vh)',
          },
          '50%': {
            transform: 'translate(50vw, -25vh)',
          },
          '75%': {
            transform: 'translate(-25vw, 25vh)',
          },
        },
        blob1: {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '25%': {
            transform: 'translate(20%, 20%) scale(1.1)',
          },
          '50%': {
            transform: 'translate(-10%, 30%) scale(0.9)',
          },
          '75%': {
            transform: 'translate(20%, 10%) scale(1.05)',
          },
        },
        blob2: {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '33%': {
            transform: 'translate(-20%, 10%) scale(1.2)',
          },
          '66%': {
            transform: 'translate(10%, -20%) scale(0.8)',
          },
        },
        blob3: {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1) rotate(0deg)',
          },
          '33%': {
            transform: 'translate(-10%, -10%) scale(1.1) rotate(120deg)',
          },
          '66%': {
            transform: 'translate(20%, 20%) scale(0.9) rotate(240deg)',
          },
        },
        liquid1: {
          '0%, 100%': { 
            transform: 'translate(0%, 0%) rotate(0deg) scale(1)',
            borderRadius: '40% 60% 70% 30% / 40% 50% 50% 60%',
          },
          '33%': { 
            transform: 'translate(2%, 1%) rotate(120deg) scale(1.1)',
            borderRadius: '70% 30% 50% 50% / 30% 40% 60% 70%',
          },
          '66%': { 
            transform: 'translate(-1%, -2%) rotate(240deg) scale(0.9)',
            borderRadius: '30% 70% 60% 40% / 50% 60% 40% 50%',
          },
        },
        liquid2: {
          '0%, 100%': { 
            transform: 'translate(0%, 0%) rotate(0deg) scale(1)',
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          },
          '33%': { 
            transform: 'translate(-2%, 1%) rotate(-120deg) scale(1.1)',
            borderRadius: '40% 60% 50% 50% / 70% 30% 40% 60%',
          },
          '66%': { 
            transform: 'translate(1%, -1%) rotate(-240deg) scale(0.9)',
            borderRadius: '50% 50% 40% 60% / 30% 70% 60% 40%',
          },
        },
        liquid3: {
          '0%, 100%': { 
            transform: 'translate(0%, 0%) rotate(0deg) scale(1)',
            borderRadius: '50% 50% 40% 60% / 40% 60% 40% 60%',
          },
          '33%': { 
            transform: 'translate(1%, -1%) rotate(60deg) scale(1.05)',
            borderRadius: '60% 40% 50% 50% / 50% 40% 60% 50%',
          },
          '66%': { 
            transform: 'translate(-1%, 1%) rotate(-60deg) scale(0.95)',
            borderRadius: '40% 60% 45% 55% / 55% 45% 55% 45%',
          },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};

export default config;
