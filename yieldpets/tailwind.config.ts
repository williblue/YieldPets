import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pastel mobile game theme
        pastel: {
          sky: '#E8F4F8',      // Light blue background
          cream: '#FFF9F5',     // Cream/off-white
          pink: '#FFB5C5',      // Soft pink
          pinkDark: '#FF9AB5',  // Darker pink for hover
          blue: '#A8D8EA',      // Pastel blue
          lavender: '#D4B5F9',  // Soft purple
          peach: '#FFD4C4',     // Peach accent
          mint: '#B5EAD7',      // Mint green
          text: '#4A5568',      // Dark gray text
          textLight: '#718096', // Light gray text
          border: '#E2E8F0',    // Border color
          success: '#81E6D9',   // Pastel success
          warning: '#FBD38D',   // Pastel warning
          danger: '#FC8181',    // Pastel danger
        },
        // Keep old vault colors for backwards compatibility
        vault: {
          bg: '#E8F4F8',
          card: '#FFFFFF',
          border: '#E2E8F0',
          accent: '#FFB5C5',
          accentDark: '#FF9AB5',
          success: '#81E6D9',
          warning: '#FBD38D',
          danger: '#FC8181',
          muted: '#718096',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(6, 182, 212, 0.6)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
export default config
