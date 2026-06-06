/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        gamana: {
          50: '#E8F4F8',
          100: '#C5E4ED',
          200: '#9DD1E1',
          300: '#74BDD4',
          400: '#4DAAC8',
          500: '#1A5F7A',
          600: '#17556E',
          700: '#134A60',
          800: '#0F3E52',
          900: '#0B3244',
          950: '#072636',
        },
        sand: {
          50: '#FAFAF8',
          100: '#F5F4F0',
          200: '#EDECE6',
          300: '#E0DED5',
        },
        trust: {
          verified: '#0D9488',
          legend: '#D97706',
          mixed: '#6B7280',
        },
        safe: {
          success: '#059669',
          warning: '#D97706',
          danger: '#DC2626',
          info: '#0284C7',
        },
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        frame: 'rgb(var(--frame) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          alt: 'rgb(var(--surface-alt) / <alpha-value>)',
          muted: 'rgb(var(--surface-muted) / <alpha-value>)',
        },
        heading: 'rgb(var(--text-heading) / <alpha-value>)',
        body: 'rgb(var(--text-body) / <alpha-value>)',
        secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        muted: 'rgb(var(--text-muted) / <alpha-value>)',
        faint: 'rgb(var(--text-faint) / <alpha-value>)',
        'border-default': 'rgb(var(--border-default) / <alpha-value>)',
        'border-subtle': 'rgb(var(--border-subtle) / <alpha-value>)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        player: 'var(--shadow-player)',
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
      },
      animation: {
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out both',
        'wave-1': 'wave 1.2s ease-in-out infinite',
        'wave-2': 'wave 1.2s ease-in-out infinite 0.2s',
        'wave-3': 'wave 1.2s ease-in-out infinite 0.4s',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out',
        'ping-slow': 'pingSlow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'pulse-slow': 'pulseSoft 3s ease-in-out infinite',
        'bounce-slow': 'bounceSlow 2s ease-in-out infinite',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        wave: {
          '0%, 100%': { height: '4px' },
          '50%': { height: '16px' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeSlideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pingSlow: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(59,130,246,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(59,130,246,0)' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
};
