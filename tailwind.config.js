/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06070a',
          900: '#0b0c12',
          850: '#10121b',
          800: '#161925',
          750: '#1d2131',
          700: '#262a3e',
        },
        brand: {
          yellow: '#FFB800',
          'yellow-light': '#FFD000',
          'yellow-neon': '#FFE600',
          orange: '#FF5722',
          'orange-glow': '#FF6D00',
          amber: '#F59E0B',
        }
      },
      boxShadow: {
        'glow-yellow-sm': '0 0 10px rgba(255, 184, 0, 0.35)',
        'glow-yellow': '0 0 20px rgba(255, 184, 0, 0.45)',
        'glow-yellow-lg': '0 0 35px rgba(255, 184, 0, 0.55)',
        'glow-orange-sm': '0 0 10px rgba(255, 87, 34, 0.4)',
        'glow-orange': '0 0 22px rgba(255, 87, 34, 0.5)',
        'glow-orange-lg': '0 0 40px rgba(255, 87, 34, 0.65)',
        'glow-amber': '0 0 25px rgba(245, 158, 11, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'lightning-glow': 'lightningGlow 2.5s ease-in-out infinite',
        'radar-scan': 'radarScan 2.5s linear infinite',
      },
      keyframes: {
        lightningGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(255, 184, 0, 0.8)) drop-shadow(0 0 18px rgba(255, 87, 34, 0.6))' },
          '50%': { filter: 'drop-shadow(0 0 16px rgba(255, 230, 0, 1)) drop-shadow(0 0 30px rgba(255, 109, 0, 0.9))' },
        },
        radarScan: {
          '0%': { transform: 'scale(0.8)', opacity: '0.9' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
