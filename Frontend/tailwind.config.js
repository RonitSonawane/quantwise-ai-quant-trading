/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
      },
      colors: {
        bg0: '#0A0A0F',
        card: '#12121A',
        brandPurple: '#7C3AED',
        brandBlue: '#2563EB',
        brandTeal: '#0D9488',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124, 58, 237, 0.25), 0 0 35px rgba(37, 99, 235, 0.12)',
      },
    },
  },
  plugins: [],
}

