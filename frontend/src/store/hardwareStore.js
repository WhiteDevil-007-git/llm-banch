// Zustand store for global hardware scan state
// Persists token to localStorage so it survives page refresh

import { create } from 'zustand'

const useHardwareStore = create((set) => ({
  token: localStorage.getItem('llmbench_token') || null,
  hardware: null,

  setToken: (token) => {
    localStorage.setItem('llmbench_token', token)
    set({ token })
  },

  setHardware: (hardware) => set({ hardware }),

  clearScan: () => {
    localStorage.removeItem('llmbench_token')
    set({ token: null, hardware: null })
  },
}))

export default useHardwareStore
