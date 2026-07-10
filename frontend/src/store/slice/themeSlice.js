import { createSlice } from '@reduxjs/toolkit'

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    isDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
    sidebarCollapsed: false
  },
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark
    },
    initTheme: (state) => {
      // just reads state, no DOM here
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    }
  }
})

export const { toggleTheme, initTheme, toggleSidebar } = themeSlice.actions
export default themeSlice.reducer