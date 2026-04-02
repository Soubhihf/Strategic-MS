import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
      },
      colors: {
        'executive-dark': '#0f1419',
        'executive-darker': '#0a0e13',
        'executive-blue': '#1e40af',
        'executive-slate': '#1e293b',
        'executive-gray': '#334155',
        'executive-light': '#e2e8f0',
      },
      backgroundColor: {
        'executive-primary': '#0f1419',
        'executive-secondary': '#1a202c',
        'executive-tertiary': '#2d3748',
      },
    },
  },
  plugins: [],
}
export default config
