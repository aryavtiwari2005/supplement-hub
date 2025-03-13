'use client'
import React, { useState, createContext, useCallback, useContext } from 'react'
import Link from 'next/link'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

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
      primary: 'bg-black',
      secondary: 'bg-gray-900'
    },
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      muted: 'text-gray-500'
    },
    border: 'border-gray-800',
    dropdown: {
      background: 'bg-gray-900',
      text: 'text-gray-300',
      hover: 'hover:bg-gray-800'
    }
  }
}

// Theme Context
interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {}
})

// Custom Theme Hook
const useTheme = () => useContext(ThemeContext)

export default function SignupPage() {
  const { theme } = useTheme()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
  
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
  
    const data = await response.json();
    alert(data.message);
  };  

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${THEMES[theme].background.primary}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`
          w-full max-w-md 
          ${THEMES[theme].background.secondary}
          ${THEMES[theme].border}
          p-8 rounded-2xl shadow-xl
        `}
      >
        <h1 className={`text-3xl font-bold mb-6 ${THEMES[theme].text.primary}`}>
          Create Account
        </h1>
        <p className={`mb-8 ${THEMES[theme].text.secondary}`}>
          Join our community today
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className={`block mb-2 ${THEMES[theme].text.secondary}`}>
              Full Name
            </label>
            <div className="relative">
              <User  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${THEMES[theme].text.muted}`} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`
                  w-full pl-12 pr-4 py-3 rounded-lg
                  ${THEMES[theme].background.primary}
                  ${THEMES[theme].text.primary}
                  ${THEMES[theme].border}
                  focus:outline-none focus:ring-2 focus:ring-yellow-500
                  transition-all duration-300
                `}
                placeholder="Enter your full name"
                required
              />
            </div>
          </motion.div>

          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
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
                  w-full pl-12 pr-4 py-3 rounded-lg
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
            transition={{ delay: 0.4 }}
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
                  w-full pl-12 pr-4 py-3 rounded-lg
                  ${THEMES[theme].background.primary}
                  ${THEMES[theme].text.primary}
                  ${THEMES[theme].border}
                  focus:outline-none focus:ring-2 focus:ring-yellow-500
                  transition-all duration-300
                `}
                placeholder="Create a password"
                required
              />
            </div>
          </motion.div>

          {/* Confirm Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className={`block mb-2 ${THEMES[theme].text.secondary}`}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${THEMES[theme].text.muted}`} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`
                  w-full pl-12 pr-4 py-3 rounded-lg
                  ${THEMES[theme].background.primary}
                  ${THEMES[theme].text.primary}
                  ${THEMES[theme].border}
                  focus:outline-none focus:ring-2 focus:ring-yellow-500
                  transition-all duration-300
                `}
                placeholder="Confirm your password"
                required
              />
            </div>
          </motion.div>

          <button
            type="submit"
            className={`
              w-full bg-yellow-500 text-white
              py-3 rounded-lg
              flex items-center justify-center space-x-2
              hover:bg-yellow-600
              transition-colors
            `}
          >
            <span>Create Account</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className={`mt-8 text-center ${THEMES[theme].text.secondary}`}>
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-yellow-500 hover:text-yellow-600 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}