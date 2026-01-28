import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppID, WindowState, ThemeConfig, FileSystemNode } from '../types';
import { WALLPAPERS } from '../wallpapers';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

interface OSState {
  windows: WindowState[];
  activeWindowId: string | null;
  theme: ThemeConfig;
  fileSystem: Record<string, FileSystemNode>;
  isLauncherOpen: boolean;
  isLocked: boolean;
  notifications: Notification[];

  // Actions
  setLocked: (locked: boolean) => void;
  launchApp: (appId: AppID, launchArgs?: any) => void;
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

  // Notification Actions
  addNotification: (title: string, message: string, type?: Notification['type']) => void;
  removeNotification: (id: string) => void;

  // File System Actions
  createFile: (parentId: string, name: string, content: string) => string;
  createFolder: (parentId: string, name: string) => void;
  deleteNode: (id: string) => void;
  renameNode: (id: string, newName: string) => void;
  updateFileContent: (id: string, content: string) => void;
}

const initialFileSystem: Record<string, FileSystemNode> = {
  'root': { id: 'root', name: 'Macintosh HD', type: 'folder', parentId: null, children: ['home'] },
  'home': { id: 'home', name: 'User', type: 'folder', parentId: 'root', children: ['docs', 'welcome'] },
  'docs': { id: 'docs', name: 'Documents', type: 'folder', parentId: 'home', children: ['notes-sample'] },
  'welcome': { id: 'welcome', name: 'welcome.txt', type: 'file', parentId: 'home', content: 'Welcome to Ether OS! This is a demo running in React.' },
  'notes-sample': { id: 'notes-sample', name: 'Ideas.txt', type: 'file', parentId: 'docs', content: '- Build a cool OS\n- Learn Gemini API\n- Coffee break' },
};

export const useOSStore = create<OSState>()(
  persist(
    (set, get) => ({
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
      isLocked: true,
      notifications: [],

      toggleLauncher: () => set((state) => ({ isLauncherOpen: !state.isLauncherOpen })),
      setLauncherOpen: (isOpen) => set({ isLauncherOpen: isOpen }),

      setLocked: (locked) => set({ isLocked: locked }),

      addNotification: (title, message, type = 'info') => {
        const id = Math.random().toString(36).substring(7);
        const newNotification: Notification = { id, title, message, type, timestamp: Date.now() };
        set((state) => ({ notifications: [newNotification, ...state.notifications] }));

        // Auto remove after 5 seconds
        setTimeout(() => {
          get().removeNotification(id);
        }, 5000);
      },

      removeNotification: (id) => {
        set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) }));
      },

      launchApp: (appId, launchArgs) => {
        const { windows } = get();

        // Check if app is already open (single instance check, optional but good for notes maybe?)
        // For now, allow multiple instances unless it's a specific app policy.
        // Actually for Notes, if we want to open a file, we might want to use existing window or open new.
        // Let's standardise: always open new window? Or focus existing if logic dictates.

        // Better: If launchArgs provided, maybe we want to pass it to NEW window.

        const id = `${appId}-${Date.now()}`;
        const maxZ = Math.max(0, ...windows.map(w => w.zIndex));

        const newWindow: WindowState = {
          id,
          appId,
          title: '',
          position: { x: 100 + windows.length * 30, y: 50 + windows.length * 30 },
          size: { width: 0, height: 0 },
          isMinimized: false,
          isMaximized: false,
          zIndex: maxZ + 1,
          launchArgs: launchArgs, // Store args here
        };

        set((state) => ({
          windows: [...state.windows, newWindow],
          activeWindowId: id,
          isLauncherOpen: false,
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
        const id = `file-${Date.now()}-${Math.random()}`;
        set((state) => {
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
        return id;
      },

      createFolder: (parentId, name) => {
        set((state) => {
          const id = `folder-${Date.now()}-${Math.random()}`;
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
      },

      deleteNode: (id) => {
        set((state) => {
          const node = state.fileSystem[id];
          if (!node) return state;
          const parentId = node.parentId;
          if (!parentId) return state;

          const parent = state.fileSystem[parentId];
          const newParent = {
            ...parent,
            children: parent.children?.filter(childId => childId !== id)
          };

          const newFileSystem = { ...state.fileSystem };
          delete newFileSystem[id];
          newFileSystem[parentId] = newParent;

          return { fileSystem: newFileSystem };
        });
      },

      renameNode: (id, newName) => {
        set((state) => ({
          fileSystem: {
            ...state.fileSystem,
            [id]: { ...state.fileSystem[id], name: newName }
          }
        }));
      },

      updateFileContent: (id, content) => {
        set((state) => ({
          fileSystem: {
            ...state.fileSystem,
            [id]: { ...state.fileSystem[id], content }
          }
        }));
      }
    }),
    {
      name: 'ether-os-storage',
      partialize: (state) => ({
        theme: state.theme,
        fileSystem: state.fileSystem,
        windows: state.windows,
        isLocked: state.isLocked
      }),
    }
  )
);