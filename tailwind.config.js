/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#14141c',
        'surface-2': '#1c1c28',
        border: '#2a2a38',
        primary: {
          DEFAULT: '#e50914',
          hover: '#f6121d',
          light: '#ff3540',
        },
        accent: '#ffb800',
        text: '#f5f5f7',
        muted: '#9a9aa8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};
