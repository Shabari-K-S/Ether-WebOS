import { create } from 'zustand';
import type { AppID, WindowState, ThemeConfig, FileSystemNode } from '../types';
import { WALLPAPERS } from '../wallpapers';

interface OSState {
  windows: WindowState[];
  activeWindowId: string | null;
  theme: ThemeConfig;
  fileSystem: Record<string, FileSystemNode>;
  isLauncherOpen: boolean;

  // Actions
  launchApp: (appId: AppID) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
  setWallpaper: (url: string) => void;
  toggleDarkMode: () => void;
  setBrightness: (value: number) => void;
  setVolume: (value: number) => void;
  toggleLauncher: () => void;
  setLauncherOpen: (isOpen: boolean) => void;

  // File System Actions
  createFile: (parentId: string, name: string, content: string) => void;
  createFolder: (parentId: string, name: string) => void;
}

const initialFileSystem: Record<string, FileSystemNode> = {
  'root': { id: 'root', name: 'Macintosh HD', type: 'folder', parentId: null, children: ['home'] },
  'home': { id: 'home', name: 'User', type: 'folder', parentId: 'root', children: ['docs', 'welcome'] },
  'docs': { id: 'docs', name: 'Documents', type: 'folder', parentId: 'home', children: [] },
  'welcome': { id: 'welcome', name: 'welcome.txt', type: 'file', parentId: 'home', content: 'Welcome to Ether OS! This is a demo running in React.' },
};

export const useOSStore = create<OSState>((set, get) => ({
  windows: [],
  activeWindowId: null,
  theme: {
    wallpaper: WALLPAPERS[0],
    isDarkMode: true,
    brightness: 100,
    volume: 50,
  },
  fileSystem: initialFileSystem,
  isLauncherOpen: false,

  toggleLauncher: () => set((state) => ({ isLauncherOpen: !state.isLauncherOpen })),
  setLauncherOpen: (isOpen) => set({ isLauncherOpen: isOpen }),

  launchApp: (appId) => {
    const { windows } = get();
    // Simple ID generation
    const id = `${appId}-${Date.now()}`;
    const newWindow: WindowState = {
      id,
      appId,
      title: '', // Title set by app usually
      position: { x: 100 + windows.length * 30, y: 50 + windows.length * 30 },
      size: { width: 0, height: 0 }, // Will be set by AppConfig default
      isMinimized: false,
      isMaximized: false,
      zIndex: windows.length + 1,
    };

    set((state) => ({
      windows: [...state.windows, newWindow],
      activeWindowId: id,
      isLauncherOpen: false, // Close launcher on app launch
    }));
  },

  closeWindow: (id) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    }));
  },

  focusWindow: (id) => {
    set((state) => {
      // Move focused window to top of z-index stack conceptually by reordering or maxing zIndex
      const maxZ = Math.max(...state.windows.map(w => w.zIndex), 0);
      const updatedWindows = state.windows.map(w =>
        w.id === id ? { ...w, zIndex: maxZ + 1 } : w
      );
      return { windows: updatedWindows, activeWindowId: id };
    });
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
      ),
      activeWindowId: null,
    }));
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      ),
    }));
  },

  updateWindowPosition: (id, x, y) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, position: { x, y } } : w
      ),
    }));
  },

  updateWindowSize: (id, width, height) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, size: { width, height } } : w
      ),
    }));
  },

  setWallpaper: (url) => {
    set((state) => ({ theme: { ...state.theme, wallpaper: url } }));
  },

  toggleDarkMode: () => {
    set((state) => ({ theme: { ...state.theme, isDarkMode: !state.theme.isDarkMode } }));
  },

  setBrightness: (value) => {
    set((state) => ({ theme: { ...state.theme, brightness: value } }));
  },

  setVolume: (value) => {
    set((state) => ({ theme: { ...state.theme, volume: value } }));
  },

  createFile: (parentId, name, content) => {
    set((state) => {
      const id = `file-${Date.now()}`;
      const newFile: FileSystemNode = { id, name, type: 'file', parentId, content };
      const parent = state.fileSystem[parentId];

      if (!parent) return state;

      return {
        fileSystem: {
          ...state.fileSystem,
          [id]: newFile,
          [parentId]: {
            ...parent,
            children: [...(parent.children || []), id]
          }
        }
      };
    });
  },

  createFolder: (parentId, name) => {
    set((state) => {
      const id = `folder-${Date.now()}`;
      const newFolder: FileSystemNode = { id, name, type: 'folder', parentId, children: [] };
      const parent = state.fileSystem[parentId];

      if (!parent) return state;

      return {
        fileSystem: {
          ...state.fileSystem,
          [id]: newFolder,
          [parentId]: {
            ...parent,
            children: [...(parent.children || []), id]
          }
        }
      };
    });
  }
}));