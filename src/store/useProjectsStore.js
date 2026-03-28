import { create } from 'zustand';

export const useProjectsStore = create((set) => ({
  projects: [
    { id: '1', title: 'My First Animation', date: '2023-10-25', frames: 12, thumbnail: null },
    { id: '2', title: 'Bouncing Ball', date: '2023-10-26', frames: 24, thumbnail: null },
  ],
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
  deleteProject: (id) => set((state) => ({ projects: state.projects.filter(p => p.id !== id) })),
}));
