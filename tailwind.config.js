/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./renderer/index.html",
    "./renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#10b981', // Vento green
          500: '#34d399',
        },
        neutral: {
          400: '#9ca3af',
          250: '#e5e7eb',
        }
      },
      maxWidth: {
        'content': '1350px',
      },
      fontFamily: {
        'kreon': ['Kreon', '__Kreon_Fallback_91f169', 'serif'],
        'shrikhand': ['Shrikhand', '__Shrikhand_Fallback_8fa858', 'cursive'],
      },
    },
  },
  plugins: [],
}
