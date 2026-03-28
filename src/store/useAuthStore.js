import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null, // { id: '1', username: 'artist', email: 'hello@example.com' }
  isAuthenticated: false,
  login: (userData) => set({ user: userData, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
