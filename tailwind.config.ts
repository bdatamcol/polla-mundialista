import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0223AD',
          dark: '#01166F',
          light: '#3352D4',
        },
        secondary: {
          DEFAULT: '#1637C7',
          dark: '#021B88',
          light: '#4E68D8',
        },
        accent: {
          DEFAULT: '#FFFF00',
          dark: '#D4D400',
          light: '#FFF76A',
        },
        background: {
          DEFAULT: '#010F4E',
          dark: '#010935',
          light: '#0223AD',
        },
        surface: {
          DEFAULT: '#0629BC',
          dark: '#031A7F',
          light: '#2444D1',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#DCE4FF',
        },
        success: '#FFF76A',
        warning: '#FFFF00',
        error: '#FF6B6B',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        body: ['Montserrat', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 255, 0, 0.25)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 255, 0, 0.45)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
