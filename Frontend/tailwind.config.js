/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070f1c',
          900: '#0a1628',
          800: '#0f1e33',
          700: '#152742',
          600: '#1d3252',
        },
        graphite: {
          900: '#141a23',
          800: '#1b2230',
          700: '#2a3441',
          600: '#3a4657',
          500: '#4e5b6e',
        },
        gold: {
          600: '#a5821b',
          500: '#c9a227',
          400: '#e8c547',
          300: '#f2da85',
        },
      },
      fontFamily: {
        display: ['Oswald', 'Saira Condensed', 'system-ui', 'sans-serif'],
        sans: ['Barlow', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 10px 30px -12px rgba(0,0,0,0.7)',
        gold: '0 0 0 1px rgba(201,162,39,0.35), 0 8px 24px -10px rgba(201,162,39,0.45)',
      },
      backgroundImage: {
        'grid-tactical':
          'linear-gradient(rgba(201,162,39,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.06) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-alert': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'pulse-alert': 'pulse-alert 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
