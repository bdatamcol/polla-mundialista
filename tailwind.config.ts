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
          DEFAULT: '#1E3A5F',
          dark: '#0F2744',
          light: '#2A4A73',
        },
        secondary: {
          DEFAULT: '#2E7D32',
          dark: '#1B5E20',
          light: '#4CAF50',
        },
        accent: {
          DEFAULT: '#FFD700',
          dark: '#C7A600',
          light: '#FFDF00',
        },
        background: {
          DEFAULT: '#0A1628',
          dark: '#050D17',
          light: '#0F1F33',
        },
        surface: {
          DEFAULT: '#1A2A42',
          dark: '#121E32',
          light: '#243652',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B0BEC5',
        },
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 215, 0, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
