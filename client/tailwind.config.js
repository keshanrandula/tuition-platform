/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f0',   // Warm soft terracotta background tint
          100: '#fbe8de',
          500: '#a2380c',  // EduLanka Core Terracotta Red
          600: '#8a2f0a',
          700: '#732708',
          900: '#431705',
          950: '#1c0a02',
        },
        lightBg: {
          body: '#ffffff',
          card: '#ffffff',
          section: '#f4f7fc', // Soft light gray-blue background
          border: '#e2e8f0',  // Slate border
          input: '#f8fafc',
          hover: '#f1f5f9'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        }
      }
    },
  },
  plugins: [],
}
