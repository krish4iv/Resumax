import { createSlice } from '@reduxjs/toolkit'

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    isDark: window.matchMedia('(prefers-color-scheme: dark)').matches
  },
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark
    },
    initTheme: (state) => {
      // just reads state, no DOM here
    }
  }
})

export const { toggleTheme, initTheme } = themeSlice.actions
export default themeSlice.reducer