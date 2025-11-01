
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Project {
  id: string;
  name: string;
  type: string;
  code?: any;
  lastModified: Date;
}

interface AppStore {
  currentProject: Project | null;
  recentProjects: Project[];
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  
  setCurrentProject: (project: Project | null) => void;
  addRecentProject: (project: Project) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  clearRecentProjects: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      currentProject: null,
      recentProjects: [],
      theme: 'dark',
      sidebarCollapsed: false,
      
      setCurrentProject: (project) => set({ currentProject: project }),
      
      addRecentProject: (project) => set((state) => ({
        recentProjects: [
          project,
          ...state.recentProjects.filter(p => p.id !== project.id)
        ].slice(0, 10)
      })),
      
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      })),
      
      toggleSidebar: () => set((state) => ({
        sidebarCollapsed: !state.sidebarCollapsed
      })),
      
      clearRecentProjects: () => set({ recentProjects: [] })
    }),
    {
      name: 'virtubuild-storage',
    }
  )
);
