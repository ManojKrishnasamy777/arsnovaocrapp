/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
       fontFamily: {
        nunito: ["Nunito", "sans-serif"],
      },
        colors: {
        primary: '#3b82f6', // choose your brand color (this one is Tailwind's blue-500)
         'white-light': '#f9fafb',
         danger: '#dc2626',
          success: '#16a34a',
          secondary: '#6c757d', 
           warning: '#facc15',
           info: '#0ea5e9', 
           dark: '#1e293b', 
           'gray-900-light': '#2e3a59',
      },
    },
  },
  plugins: [],
};
