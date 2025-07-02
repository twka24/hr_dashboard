/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',                      // ⬅️  kunci agar <html class="dark"> aktif
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
