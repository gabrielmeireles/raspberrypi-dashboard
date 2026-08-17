/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{svelte,js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: '#111827',
        'surface-elevated': '#1e293b',
        'surface-highlight': '#334155',
        mvg: {
          u1: '#468444',
          u2: '#dd3b2b',
          u3: '#ef7c00',
          u4: '#00ab84',
          u5: '#b97017',
          u6: '#0065ae',
          tram: '#d82020',
          bus: '#0d5c75',
          sbahn: '#4fa83d',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      screens: {
        rpi: '800px',
      },
    },
  },
  plugins: [],
};
