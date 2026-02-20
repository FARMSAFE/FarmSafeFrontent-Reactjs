/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cabinet Grotesk', 'sans-serif'],
        body: ['Satoshi', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        earth: {
          50:  '#f7f3ee',
          100: '#ede4d6',
          200: '#d9c9b0',
          300: '#c4a882',
          400: '#b08a5c',
          500: '#8f6a3e',
          600: '#735130',
          700: '#593e26',
          800: '#3d2a1a',
          900: '#21160d',
        },
        leaf: {
          50:  '#f0f9f0',
          100: '#dcf0db',
          200: '#b5e0b3',
          300: '#82c87f',
          400: '#4fab4a',
          500: '#2d8f2a',
          600: '#1f7220',
          700: '#185718',
          800: '#113d12',
          900: '#092209',
        },
        sky: {
          50:  '#eff8ff',
          100: '#dbeefe',
          200: '#b0ddfd',
          300: '#7dc5fb',
          400: '#42a6f5',
          500: '#1787e0',
          600: '#0d6cbf',
          700: '#0a549a',
          800: '#083d72',
          900: '#052649',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-in': 'slideIn 0.3s ease forwards',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideIn: {
          '0%': { opacity: 0, transform: 'translateX(-12px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      }
    },
  },
  plugins: [],
}
