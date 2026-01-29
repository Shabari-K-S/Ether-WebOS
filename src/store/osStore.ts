import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppID, WindowState, ThemeConfig, FileSystemNode, LauncherItem, LauncherFolder } from '../types';
import { APP_METADATA } from '../apps.config';
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
  // Launcher Actions
  createLauncherFolder: (name: string) => void;
  addAppToLauncherFolder: (folderId: string, appId: AppID) => void;
  removeAppFromLauncherFolder: (folderId: string, appId: AppID) => void;
  renameLauncherFolder: (folderId: string, newName: string) => void;
  moveLauncherItem: (activeId: string, overId: string) => void;
  deleteLauncherFolder: (folderId: string) => void;
  isShuttingDown: boolean;
  isRestarting: boolean;
  isPoweredOff: boolean;
  setIsShuttingDown: (val: boolean) => void;
  setIsRestarting: (val: boolean) => void;
  setIsPoweredOff: (val: boolean) => void;
  launcherItems: LauncherItem[];
}

const initialLauncherItems: LauncherItem[] = Object.keys(APP_METADATA)
  .filter(id => !APP_METADATA[id as AppID].hideFromLauncher)
  .map(id => ({ type: 'app', id: id as AppID }));

const initialFileSystem: Record<string, FileSystemNode> = {
  'root': { id: 'root', name: 'Macintosh HD', type: 'folder', parentId: null, children: ['home'] },
  'home': { id: 'home', name: 'User', type: 'folder', parentId: 'root', children: ['docs'] },
  'docs': { id: 'docs', name: 'Documents', type: 'folder', parentId: 'home', children: ['welcome'] },
  'welcome': { id: 'welcome', name: 'welcome.txt', type: 'file', parentId: 'docs', content: 'Welcome to Ether OS! This is a demo running in React.' },
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
      launcherItems: initialLauncherItems,
      isLauncherOpen: false,
      isLocked: true,
      isShuttingDown: false,
      isRestarting: false,
      isPoweredOff: true,
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
      },

      createLauncherFolder: (name) => {
        set((state) => {
          const id = `folder-${Date.now()}`;
          const newFolder: LauncherItem = { type: 'folder', id, name, appIds: [] };
          return { launcherItems: [newFolder, ...state.launcherItems] };
        });
      },

      addAppToLauncherFolder: (folderId, appId) => {
        set((state) => ({
          launcherItems: state.launcherItems
            .map(item => {
              if (item.type === 'folder' && item.id === folderId) {
                return { ...item, appIds: [...new Set([...item.appIds, appId])] };
              }
              return item;
            })
            .filter(item => !(item.type === 'app' && item.id === appId))
        }));
      },

      removeAppFromLauncherFolder: (folderId, appId) => {
        set((state) => {
          const folder = state.launcherItems.find(i => i.type === 'folder' && i.id === folderId) as LauncherFolder | undefined;
          if (!folder) return state;

          const newFolder = { ...folder, appIds: folder.appIds.filter(id => id !== appId) };
          const newApp: LauncherItem = { type: 'app', id: appId };

          return {
            launcherItems: [
              ...state.launcherItems.map(item => item.id === folderId ? newFolder : item),
              newApp
            ]
          };
        });
      },

      renameLauncherFolder: (folderId, newName) => {
        set((state) => ({
          launcherItems: state.launcherItems.map(item =>
            (item.type === 'folder' && item.id === folderId) ? { ...item, name: newName } : item
          )
        }));
      },

      moveLauncherItem: (activeId, overId) => {
        set((state) => {
          const oldIndex = state.launcherItems.findIndex(i => i.id === activeId);
          const newIndex = state.launcherItems.findIndex(i => i.id === overId);
          if (oldIndex === -1 || newIndex === -1) return state;

          const newItems = [...state.launcherItems];
          const [removed] = newItems.splice(oldIndex, 1);
          newItems.splice(newIndex, 0, removed);
          return { launcherItems: newItems };
        });
      },

      deleteLauncherFolder: (folderId) => {
        set((state) => {
          const folder = state.launcherItems.find(i => i.type === 'folder' && i.id === folderId) as LauncherFolder | undefined;
          if (!folder) return state;

          const contents: LauncherItem[] = folder.appIds.map(id => ({ type: 'app', id }));
          return {
            launcherItems: [
              ...state.launcherItems.filter(item => item.id !== folderId),
              ...contents
            ]
          };
        });
      },

      setIsShuttingDown: (val) => set({ isShuttingDown: val }),
      setIsRestarting: (val) => set({ isRestarting: val }),
      setIsPoweredOff: (val) => set({ isPoweredOff: val }),
    }),
    {
      name: 'ether-os-storage',
      version: 2,
      partialize: (state) => ({
        theme: state.theme,
        fileSystem: state.fileSystem,
        windows: state.windows,
        isLocked: state.isLocked,
        launcherItems: state.launcherItems
      }),
    }
  )
);