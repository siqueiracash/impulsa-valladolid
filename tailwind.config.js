/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-cream': '#FDFBF7',
        'brand-teal': '#1E3E3E',
        'brand-orange': '#F59E0B',
        'brand-red': '#D94648',
      },
    },
  },
  plugins: [],
}
