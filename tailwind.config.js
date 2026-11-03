/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      animation: {
        'float-soft': 'float-soft 7s ease-in-out infinite',
      },
      keyframes: {
        'float-soft': {
          '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1deg)' },
        },
      },
      boxShadow: {
        'card-soft': '0 12px 36px rgba(51, 65, 85, 0.09)',
      },
    },
  },
  plugins: [],
};
