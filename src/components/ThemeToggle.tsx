// src/components/ThemeToggle.tsx
'use client'

import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  toggleTheme, 
  selectTheme 
} from '@/redux/themeSlice'
import { Sun, Moon } from 'lucide-react'
import { THEMES } from '@/utils/theme'

export default function ThemeToggle() {
  const theme = useSelector(selectTheme)
  const dispatch = useDispatch()

  return (
    <button 
      onClick={() => dispatch(toggleTheme())}
      className={`
        p-2 rounded-full 
        ${theme === 'light' 
          ? 'bg-yellow-100 text-gray-800 hover:bg-yellow-200' 
          : 'bg-gray-800 text-white hover:bg-gray-700'}
        transition-colors duration-300
        flex items-center justify-center
      `}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
    </button>
  )
}