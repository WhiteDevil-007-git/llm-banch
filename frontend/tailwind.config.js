/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0d0d0f',
        'bg-card': '#13131a',
        'bg-hover': '#1e1e28',
        'border-dark': '#1e1e28',
        'text-primary': '#e0dfd6',
        'text-secondary': '#6a6a72',
        'accent-blue': '#3a6aaa',
        'accent-green': '#3cb080',
        'accent-amber': '#e0a040',
        'accent-red': '#d06050',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
