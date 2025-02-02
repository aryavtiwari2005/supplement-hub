// src/redux/themeSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import { RootState } from './store'

type Theme = 'light' | 'dark'

interface ThemeState {
  currentTheme: Theme
}

const initialState: ThemeState = {
  currentTheme: 'light'
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.currentTheme = state.currentTheme === 'light' ? 'dark' : 'light'
    },
    setTheme: (state, action) => {
      state.currentTheme = action.payload
    }
  }
})

export const { toggleTheme, setTheme } = themeSlice.actions

export const selectTheme = (state: RootState) => state.theme.currentTheme

export default themeSlice.reducer