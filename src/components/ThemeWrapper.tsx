// src/components/ThemeWrapper.tsx
'use client'

import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectTheme } from '@/redux/themeSlice'
import { THEMES } from '@/utils/theme'

export default function ThemeWrapper({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const theme = useSelector(selectTheme)

  useEffect(() => {
    // Update document classes
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)

    // Update body classes for global styling
    document.body.className = `
      ${THEMES[theme].background.primary}
      ${THEMES[theme].text.primary}
      min-h-screen
      transition-colors duration-300
    `
  }, [theme])

  return <>{children}</>
}