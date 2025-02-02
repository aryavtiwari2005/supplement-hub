import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Font Families
      fontFamily: {
        'sans': ['Inter', ...defaultTheme.fontFamily.sans],
        'display': ['Playfair Display', 'serif'],
        'body': ['Open Sans', 'sans-serif'],
        'accent': ['Montserrat', 'sans-serif']
      },

      // Brand Colors
      colors: {
        // White and Yellow Palette
        'brand': {
          'white': {
            DEFAULT: '#FFFFFF',
            light: '#F5F5F5',
            dark: '#E0E0E0'
          },
          'yellow': {
            DEFAULT: '#FFD700',
            light: '#FFEC8B',
            dark: '#FFC107',
            hero: {
              light: '#FFF9C4',
              dark: '#FFC107'
            }
          },
          'accent': {
            light: 'var(--light-accent, #FFD700)',
            dark: 'var(--dark-accent, #FFC107)',
            DEFAULT: 'var(--accent-color, #FFD700)'
          }
        },
        
        // Background Colors
        'background': {
          primary: {
            light: 'var(--light-background-primary, #FFFFFF)',
            dark: 'var(--dark-background-primary, #121212)',
            DEFAULT: 'var(--background-primary, #FFFFFF)'
          },
          secondary: {
            light: 'var(--light-background-secondary, #F5F5F5)',
            dark: 'var(--dark-background-secondary, #1E1E1E)',
            DEFAULT: 'var(--background-secondary, #F0F0F0)'
          },
          // Hero Section Background
          hero: {
            light: 'var(--hero-yellow-light, #FFF9C4)',
            dark: 'var(--hero-yellow-dark, #FFC107)'
          }
        },
        
        // Text Colors
        'text': {
          primary: {
            light: 'var(--light-text-primary, #000000)',
            dark: 'var(--dark-text-primary, #FFFFFF)',
            DEFAULT: 'var(--text-primary, #333333)'
          },
          secondary: {
            light: 'var(--light-text-secondary, #666666)',
            dark: 'var(--dark-text-secondary, #CCCCCC)',
            DEFAULT: 'var(--text-secondary, #555555)'
          }
        },
        
        // Border Colors
        'border': {
          light: 'var(--light-border, #E0E0E0)',
          dark: 'var(--dark-border, #333333)',
          DEFAULT: 'var(--border-color, #CCCCCC)'
        }
      },

      // Typography Scales
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1', fontWeight: '700' }],
        '6xl': ['3.75rem', { lineHeight: '1', fontWeight: '700' }],
        '7xl': ['4.5rem', { lineHeight: '1', fontWeight: '700' }],
        '8xl': ['6rem', { lineHeight: '1', fontWeight: '700' }],
        '9xl': ['8rem', { lineHeight: '1', fontWeight: '700' }],
      },

      // Background Images and Gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        
        // Theme Gradients
        'theme-gradient': {
          light: 'linear-gradient(to right, #FFFFFF, #F5F5F5)',
          dark: 'linear-gradient(to right, #121212, #1E1E1E)'
        },
        // Hero Section Gradient
        'hero-gradient': {
          light: 'linear-gradient(to right, #FFF9C4, #FFF59D)',
          dark: 'linear-gradient(to right, #FFC107, #FFD54F)'
        }
      },

      // Shadow System
      boxShadow: {
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'theme': {
          light: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          dark: '0 4px 6px -1px rgba(255, 255, 255, 0.1), 0 2px 4px -1px rgba(255, 255, 255, 0.06)'
        }
      },

      // Letter Spacing
      letterSpacing: {
        'tight': '-0.02em',
        'wide': '0.02em',
        'wider': '0.05em',
        'widest': '0.1em'
      },

      // Responsive Breakpoints
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px'
      }
    },
  },
  
  // Plugins
  plugins: [
    typography,
    function({ addUtilities }) {
      const themeUtilities = {
        // Theme Transition
        '.theme-transition': {
          transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
        },
        // Text Utilities
        '.text-classy-title': {
          fontFamily: 'Playfair Display, serif',
          fontWeight: '700',
          letterSpacing: '-0.02em'
        },
        '.text-classy-subtitle': {
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: '600',
          textTransform: 'uppercase'
        }
      }
      addUtilities(themeUtilities)
    }
  ]
}

export default config