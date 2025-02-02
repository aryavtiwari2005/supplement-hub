'use client'

import { useRouter } from 'next/navigation';
import React, { useState, createContext, useCallback, useContext } from 'react'
import Link from 'next/link'
import { Moon, Sun, Mail, Lock, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Theme = 'light' | 'dark'

const THEMES = {
  light: {
    background: {
      primary: 'bg-white',
      secondary: 'bg-yellow-50'
    },
    text: {
      primary: 'text-black',
      secondary: 'text-gray-700',
      muted: 'text-gray-500'
    },
    border: 'border-gray-200',
    dropdown: {
      background: 'bg-yellow-50',
      text: 'text-gray-800',
      hover: 'hover:bg-yellow-100'
    }
  },
  dark: {
    background: {
      primary: 'bg-gray-900',
      secondary: 'bg-gray-800'
    },
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      muted: 'text-gray-500'
    },
    border: 'border-gray-700',
    dropdown: {
      background: 'bg-gray-800',
      text: 'text-gray-300',
      hover: 'hover:bg-gray-700'
    }
  }
}

// Theme Context (remains the same as in the previous code)
interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {}
})

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light')

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push('/profile');
      } else {
        const { message } = await res.json();
        setError(message);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <div className={`min-h-screen flex items-center justify-center p-4 pt-20 ${THEMES[theme].background.primary}`}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 10 
          }}
          className={`
            w-full max-w-md 
            ${THEMES[theme].background.secondary}
            ${THEMES[theme].border}
            p-8 rounded-3xl shadow-2xl
            border
          `}
        >
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-4xl font-bold mb-6 ${THEMES[theme].text.primary}`}
          >
            Welcome Back
          </motion.h1>
          <p className={`mb-8 ${THEMES[theme].text.secondary}`}>
            Please sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className={`block mb-2 ${THEMES[theme].text.secondary}`}>
                Email
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${THEMES[theme].text.muted}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`
                    w-full pl-12 pr-4 py-3 rounded-xl
                    ${THEMES[theme].background.primary}
                    ${THEMES[theme].text.primary}
                    ${THEMES[theme].border}
                    focus:outline-none focus:ring-2 focus:ring-yellow-500
                    transition-all duration-300
                  `}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className={`block mb-2 ${THEMES[theme].text.secondary}`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${THEMES[theme].text.muted}`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`
                    w-full pl-12 pr-4 py-3 rounded-xl
                    ${THEMES[theme].background.primary}
                    ${THEMES[theme].text.primary}
                    ${THEMES[theme].border}
                    focus:outline-none focus:ring-2 focus:ring-yellow-500
                    transition -all duration-300
                  `}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </motion.div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded text-yellow-500 focus:ring-yellow-500"
                />
                <span className={`ml-2 ${THEMES[theme].text.secondary}`}>
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-yellow-500 hover:text-yellow-600 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              className={`
                w-full bg-yellow-500 text-white
                py-3 rounded-lg
                flex items-center justify-center space-x-2
                hover:bg-yellow-600
                transition-colors
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>

          <p className={`mt-8 text-center ${THEMES[theme].text.secondary}`}>
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-yellow-500 hover:text-yellow-600 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  )
}