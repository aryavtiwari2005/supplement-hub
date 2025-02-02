// src/utils/theme.ts
export type Theme = 'light' | 'dark'
export type ThemeType = 'background' | 'text' | 'accent' | 'border'
export type ThemeVariant = 'primary' | 'secondary' | 'default'

interface ThemeClasses {
  background: {
    primary: string
    secondary: string
    default: string
  }
  text: {
    primary: string
    secondary: string
    default: string
  }
  accent: string
  border: {
    primary: string
    secondary: string
    default: string
  }
}

export const THEMES: Record<Theme, ThemeClasses> = {
  light: {
    background: {
      primary: 'bg-[var(--light-background-primary)]',
      secondary: 'bg-[var(--light-background-secondary)]',
      default: 'bg-[var(--background-primary)]'
    },
    text: {
      primary: 'text-[var(--light-text-primary)]',
      secondary: 'text-gray-700',
      default: 'text-[var(--text-primary)]'
    },
    accent: 'text-[var(--light-accent-color)]',
    border: {
      primary: 'border-[var(--light-border-primary)]',
      secondary: 'border-[var(--light-border-secondary)]',
      default: 'border-[var(--border-color)]'
    }
  },
  dark: {
    background: {
      primary: 'bg-[var(--dark-background-primary)]',
      secondary: 'bg-[var(--dark-background-secondary)]',
      default: 'bg-[var(--background-primary)]'
    },
    text: {
      primary: 'text-[var(--dark-text-primary)]',
      secondary: 'text-gray-300',
      default: 'text-[var(--text-primary)]'
    },
    accent: 'text-[var(--dark-accent-color)]',
    border: {
      primary: 'border-[var(--dark-border-primary)]',
      secondary: 'border-[var(--dark-border-secondary)]',
      default: 'border-[var(--border-color)]'
    }
  }
}

export function getThemeClass(
  theme: Theme, 
  type: ThemeType, 
  variant: ThemeVariant = 'default'
): string {
  switch (type) {
    case 'accent':
      return THEMES[theme].accent
    case 'background':
    case 'text':
    case 'border':
      return THEMES[theme][type][variant]
    default:
      return THEMES[theme].background.default
  }
}

// Utility function to combine theme classes
export function combineThemeClasses(
  theme: Theme, 
  ...classes: (ThemeType | string)[]
): string {
  return classes.map(classOrType => 
    typeof classOrType === 'string' 
      ? classOrType 
      : getThemeClass(theme, classOrType)
  ).join(' ')
}

// Predefined theme transitions
export const THEME_TRANSITIONS = {
  background: 'transition-colors duration-300 ease-in-out',
  text: 'transition-colors duration-300 ease-in-out',
  all: 'transition-all duration-300 ease-in-out'
}