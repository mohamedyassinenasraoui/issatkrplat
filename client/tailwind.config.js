/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ISSAT Kairouan official colors
        issat: {
          navy: '#1E3A5F',      // Dark navy blue from logo
          navyLight: '#2B4C73', // Lighter navy
          navyDark: '#152942',  // Darker navy
          red: '#C41E3A',       // Red from logo
          redLight: '#D93954',  // Lighter red
          redDark: '#A11830',   // Darker red
        },
        // Official landing page colors
        official: {
          blue: '#2B4C66',      // Bleu profond
          cream: '#F5F4EF',     // Blanc cassé
          olive: '#6B8E23',     // Vert olive
          sand: '#E3C6A4',      // Sable/Ocre
        },
        // Academic theme (light mode)
        academic: {
          bg: '#F8FAFC',        // Light gray background
          surface: '#FFFFFF',    // White surfaces
          surfaceAlt: '#F1F5F9', // Alternate surface
          border: '#E2E8F0',     // Light border
          text: '#1E293B',       // Dark text
          textMuted: '#64748B',  // Muted text
        },
        // Dark theme
        dark: {
          bg: '#0F172A',
          surface: '#1E293B',
          surfaceHover: '#334155',
          border: '#334155',
          text: '#F1F5F9',
          textMuted: '#94A3B8',
          accent: '#1E3A5F',
          accentHover: '#2B4C73',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#C41E3A',
          primary: '#1E3A5F',
          secondary: '#C41E3A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
