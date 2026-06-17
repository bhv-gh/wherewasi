/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        accent: '#2563eb',
        ok: '#16a34a',
        warn: '#d97706',
        danger: '#dc2626',
      },
    },
  },
  plugins: [],
};
