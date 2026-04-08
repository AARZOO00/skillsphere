/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom monochromatic indigo-purple palette
        night: '#1B003F',
        twilight: '#4B0082',
        midnight: '#191970',
        lavender: '#E6E6FA',
        dusky: '#6495ED',
        primary: {
          50: '#f4f3ff',
          100: '#E6E6FA',
          200: '#ceccf7',
          300: '#a88aed',
          400: '#7d4dcd',
          500: '#4B0082',
          600: '#1B003F',
          700: '#191970',
          800: '#120a3a',
          900: '#0a071e',
        },
        secondary: '#4B0082',
        accent: {
          400: '#6495ED',
          500: '#4E8AE0',
        },
        palette: {
          night: '#1B003F',
          twilight: '#4B0082',
          midnight: '#191970',
          lavender: '#E6E6FA',
          dusky: '#6495ED',
        },
        gradient: {
          start: '#1B003F',
          mid: '#4B0082',
          end: '#6495ED',
        },
      },
      fontFamily: {
        'sans': ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        'display': ['Syne', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(27, 0, 63, 0.08)',
        'medium': '0 4px 25px rgba(27, 0, 63, 0.12)',
        'large': '0 8px 40px rgba(27, 0, 63, 0.15)',
        'glow': '0 0 20px rgba(75, 0, 130, 0.3)',
      },
    },
  },
  plugins: [],
}