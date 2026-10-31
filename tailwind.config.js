/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: '#151F30',
          selected: '#303B59',
          hover: '#1E2B42',
          text: '#F4F6FF',
          secondary: '#C5CEE4',
          muted: '#8093BB',
          card: '#1B2949',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        brand: {
          primary: '#5145FF',
          hover: '#4336EA',
          accent: '#6654FF',
          light: '#F0EDFF'
        },
        panel: {
          bg: '#FFFFFF',
          darkBg: '#1A233A',
          border: '#E9EDF5',
          darkBorder: '#283655'
        },
        main: {
          bg: '#F6F8FC',
          darkBg: '#0F172A',
          text: '#142039',
          darkText: '#F1F5F9',
          body: '#42577D',
          darkBody: '#94A3B8',
          muted: '#7183A6',
          darkMuted: '#64748B'
        },
        tag: {
          workBg: '#DCEAFF',
          workText: '#1769E8',
          personalBg: '#D6F8E7',
          personalText: '#14844F',
          ideasBg: '#EBDDFF',
          ideasText: '#783DE8',
          learningBg: '#FFE8CC',
          learningText: '#B85D00',
          othersBg: '#E5EAF4',
          othersText: '#3C4D6B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.03)',
        'btn': '0 2px 8px rgba(81, 69, 255, 0.25)',
        'popover': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}

