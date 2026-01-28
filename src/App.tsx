import { useState, useCallback } from 'react';
import { useOSStore } from './store/osStore';
import MenuBar from './components/os/MenuBar';
import Dock from './components/os/Dock';
import Window from './components/os/Window';
import AppLauncher from './components/os/AppLauncher';
import type { ContextMenuItem } from './components/os/ContextMenu';
import ContextMenu from './components/os/ContextMenu';
import { WALLPAPERS } from './wallpapers';

import LockScreen from './components/os/LockScreen';

function App() {
  const { theme, windows, setWallpaper, createFolder, isLocked } = useOSStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    // Only show menu if clicking directly on the desktop background
    // We can rely on bubbling if we attach to the main div, 
    // but windows shouldn't trigger this if they stop propagation.
    e.preventDefault();

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          label: 'New Folder',
          action: () => createFolder('home', 'New Folder'),
        },
        { separator: true, label: '' },
        {
          label: 'Change Wallpaper',
          action: () => {
            const currentIndex = WALLPAPERS.indexOf(theme.wallpaper);
            const nextIndex = (currentIndex + 1) % WALLPAPERS.length;
            setWallpaper(WALLPAPERS[nextIndex]);
          }
        },
        { separator: true, label: '' },
        {
          label: 'Refresh',
          action: () => window.location.reload(),
        }
      ]
    });
  }, [theme.wallpaper, createFolder, setWallpaper]);

  const handleCloseMenu = () => setContextMenu(null);

  return (
    <div
      className="h-screen w-screen overflow-hidden relative bg-cover bg-center transition-[background-image] duration-500 ease-in-out"
      style={{ backgroundImage: `url(${theme.wallpaper})` }}
      onContextMenu={handleContextMenu}
      onClick={handleCloseMenu}
    >
      {/* Overlay for Dark Mode / brightness control */}
      <div className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${theme.isDarkMode ? 'bg-black/40' : 'bg-black/10'}`} />

      {isLocked && <LockScreen />}

      {/* OS UI Layer */}
      <MenuBar />

      {/* Desktop Area - Windows container */}
      <div className="absolute inset-0 pointer-events-none">
        {/* All windows are rendered here. We ensure the container is transparent to clicks, 
            but windows themselves will be interactive. */}
        <div className="w-full h-full relative pointer-events-none">
          {windows.map((windowState) => (
            <div key={windowState.id} className="pointer-events-auto absolute">
              <Window windowState={windowState} />
            </div>
          ))}
        </div>
      </div>

      <AppLauncher />
      <Dock />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={handleCloseMenu}
        />
      )}
    </div>
  );
}

export default App;