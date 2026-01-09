/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Classic Library Color Palette
        // Warm, sophisticated tones inspired by leather-bound books and old wood

        // Base colors - Cream and warm grays instead of stark white/black
        cream: {
          50: '#FDFCFA',
          100: '#FAF8F5',
          200: '#F5F1EB',
          300: '#EDE7DD',
          400: '#E3D9C8',
        },
        parchment: '#F9F6F1',
        ink: {
          DEFAULT: '#2C2419',
          light: '#3D3529',
        },

        // Discipline Layer - Deep Navy/Slate (Foundation & Stability)
        discipline: {
          primary: '#2C3E50',    // Deep slate blue
          secondary: '#34495E',   // Warm slate
          accent: '#546E7A',      // Lighter slate
          light: '#78909C',       // Soft slate
        },

        // Values Layer - Burgundy/Wine (Wisdom & Depth)
        values: {
          primary: '#6B2737',     // Deep burgundy
          secondary: '#8B3A4A',   // Rich wine
          accent: '#A85968',      // Dusty rose
          light: '#C08B96',       // Soft rose
        },

        // Control Layer - Forest Green (Order & Growth)
        control: {
          primary: '#2D5016',     // Deep forest green
          secondary: '#3D6B2A',   // Rich moss
          accent: '#5A8744',      // Sage green
          light: '#7FA765',       // Soft sage
        },

        // Vision Layer - Amber/Gold (Aspiration & Illumination)
        vision: {
          primary: '#8B6914',     // Deep amber
          secondary: '#A67C1B',   // Rich gold
          accent: '#C5973F',      // Warm gold
          light: '#D4B26A',       // Soft gold
        },

        // Accent colors
        leather: {
          dark: '#4A2C2A',
          medium: '#6B4423',
          light: '#8B6F47',
        },
        wood: {
          dark: '#3E2723',
          medium: '#5D4037',
          light: '#8D6E63',
        },
        brass: {
          dark: '#B8860B',
          DEFAULT: '#DAA520',
          light: '#F0C674',
        },
      },
      fontFamily: {
        // Elegant serif fonts for headings
        serif: ['Merriweather', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        // Clean serif for body text
        sans: ['Source Serif Pro', 'Georgia', 'serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.6' }],
        'base': ['1rem', { lineHeight: '1.7' }],
        'lg': ['1.125rem', { lineHeight: '1.7' }],
        'xl': ['1.25rem', { lineHeight: '1.6' }],
        '2xl': ['1.5rem', { lineHeight: '1.5' }],
        '3xl': ['1.875rem', { lineHeight: '1.4' }],
        '4xl': ['2.25rem', { lineHeight: '1.3' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
      },
      borderRadius: {
        'sm': '0.25rem',
        DEFAULT: '0.375rem',
        'md': '0.5rem',
        'lg': '0.625rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'sm': '0 1px 3px 0 rgba(44, 36, 25, 0.08)',
        DEFAULT: '0 2px 6px 0 rgba(44, 36, 25, 0.1)',
        'md': '0 4px 12px 0 rgba(44, 36, 25, 0.12)',
        'lg': '0 8px 24px 0 rgba(44, 36, 25, 0.15)',
        'xl': '0 12px 32px 0 rgba(44, 36, 25, 0.18)',
        'inner': 'inset 0 2px 4px 0 rgba(44, 36, 25, 0.06)',
      },
      backgroundImage: {
        'gradient-discipline': 'linear-gradient(135deg, #2C3E50 0%, #546E7A 100%)',
        'gradient-values': 'linear-gradient(135deg, #6B2737 0%, #A85968 100%)',
        'gradient-control': 'linear-gradient(135deg, #2D5016 0%, #5A8744 100%)',
        'gradient-vision': 'linear-gradient(135deg, #8B6914 0%, #C5973F 100%)',
      },
    },
  },
  plugins: [],
}
