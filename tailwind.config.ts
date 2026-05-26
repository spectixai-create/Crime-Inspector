import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0a0a',
          900: '#121212',
          800: '#1a1a1a',
          700: '#2a2a2a',
          600: '#333333',
        },
        noir: {
          deep: '#0A0B0E',
          base: '#14161D',
          elev: '#1C1F28',
          'elev-2': '#252834',
        },
        'paper-cream': '#E8E2D0',
        'amber-noir': '#D4A574',
        'red-doc': '#B8463A',
        'green-sage': '#6B8F5A',
      },
      fontFamily: {
        display: ['Frank Ruhl Libre', 'Times New Roman', 'serif'],
        ui: ['Assistant', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        serif: ['Frank Ruhl Libre', 'Times New Roman', 'serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        blink: {
          '0%, 80%, 100%': { opacity: '0.3' },
          '40%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        slideUp: 'slideUp 0.25s ease-out',
        blink: 'blink 1.4s infinite both',
      },
    },
  },
  plugins: [],
};

export default config;
