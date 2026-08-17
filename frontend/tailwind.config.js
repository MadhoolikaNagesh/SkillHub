/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#adc2ff',
          400: '#7599ff',
          500: '#4a6cf7',
          600: '#3352db',
          700: '#283ebd',
          800: '#24349c',
          900: '#22307e',
          950: '#141c4f',
        },
        dark: {
          50: '#f6f6f7',
          100: '#e1e2e5',
          200: '#c2c5cb',
          300: '#9aa0a9',
          400: '#747c87',
          500: '#5a616d',
          600: '#4a4f59',
          700: '#383a42',
          800: '#2b2d35',
          900: '#1f2026',
          950: '#121319',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
