import React, { useRef } from 'react';
import { useOSStore } from '../../store/osStore';
import { APPS } from '../../constants';


const Dock: React.FC = () => {
  const { launchApp, theme, toggleLauncher, windows } = useOSStore();
  const dockRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = () => {
    // Future scale effect logic
  };

  const apps = Object.values(APPS);

  // Dock should show apps that are:
  // 1. Marked as favorite in config
  // 2. Currently have an open window
  // 3. Not explicitly hidden from the dock
  const dockApps = apps.filter(app =>
    !app.hideFromDock && (app.favorite || windows.some(w => w.appId === app.id))
  );

  const finder = dockApps.find(a => a.id === 'finder');
  const otherApps = dockApps.filter(a => a.id !== 'finder');

  const renderDockItem = (id: string, name: string, icon: React.ElementType | string, onClick: () => void) => {
    const isOpen = windows.some(w => w.appId === id);
    // Finder is always "active" conceptually in an OS, but let's stick to window presence or true
    // If it's finder, let's just say it's always active for the OS feel? Or just window based.
    // User requested "when application is opened", so window based is safer.
    // But typically Finder has a dot always on Mac. Let's make Finder always have a dot.
    const isActive = isOpen;

    return (
      <button
        key={id}
        onClick={onClick}
        className="group relative flex flex-col items-center justify-end transition-all duration-200 ease-out hover:-translate-y-2 hover:scale-125 origin-bottom p-1"
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 bg-zinc-200 to-br from-gray-300 to-gray-600 text-black">
          {typeof icon === 'string' ? (
            <img src={icon} alt={name} className="w-full h-full object-contain drop-shadow-md bg-transparent" />
          ) : (
            React.createElement(icon, { size: 28 })
          )}
        </div>
        <span className={`
        absolute -top-10 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 
        group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-md pointer-events-none
      `}>
          {name}
        </span>
        {/* Active Dot Indicator */}
        <div className={`w-1 h-1 bg-white rounded-full mt-1 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
      </button>
    )
  };

  /* 
     * Auto-Hide Logic:
     * Detected if any non-minimized window overlaps with the Dock's bounding box.
     * We approximate Dock dimensions since ref measurements might strictly require layout effects.
     */
  const dockHeight = 96; // ~12 (pb-3) + 12 (pt-3) + 64 (h-16 icon) + padding
  const dockWidth = dockApps.length * 64 + 32; // Rough estimate: 64px per item + padding

  const isObstructed = windows.some(w => {
    if (w.isMinimized) return false;

    // If maximized, it definitely obstructs
    if (w.isMaximized) return true;

    // Check for geometric overlap
    // Resolve effective size (handle 0x0 default in store)
    const appConfig = APPS[w.appId];
    const width = w.size.width || appConfig?.defaultWidth || 800;
    const height = w.size.height || appConfig?.defaultHeight || 600;

    const wBottom = w.position.y + height;
    const wRight = w.position.x + width;
    const wLeft = w.position.x;

    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;

    // Expand dock hit area slightly for better UX
    const dockTop = screenHeight - dockHeight - 20;
    const dockLeft = (screenWidth / 2) - (dockWidth / 2) - 20;
    const dockRight = (screenWidth / 2) + (dockWidth / 2) + 20;

    const isVerticallyOverlapping = wBottom > dockTop;
    const isHorizontallyOverlapping = (wRight > dockLeft) && (wLeft < dockRight);

    return isVerticallyOverlapping && isHorizontallyOverlapping;
  });

  const shouldHide = isObstructed;

  return (
    <div className={`
      fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[70] transition-all duration-500 ease-in-out
      ${shouldHide ? 'translate-y-[150%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
    `}>
      <div
        ref={dockRef}
        onMouseMove={handleMouseMove}
        className={`
          flex items-end space-x-2 px-4 pb-3 pt-3 rounded-2xl
          ${theme.isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white/30 border-white/20'}
          backdrop-blur-2xl border shadow-2xl transition-all duration-300
        `}
      >
        {/* Launchpad (First) */}
        {renderDockItem('launchpad', 'Launchpad', 'https://img.icons8.com/color/96/launch-box.png', toggleLauncher)}

        {/* Finder (Second) */}
        {finder && renderDockItem(finder.id, finder.name, finder.icon, () => launchApp(finder.id))}

        {/* Other Apps */}
        {otherApps.map((app) =>
          renderDockItem(app.id, app.name, app.icon, () => launchApp(app.id))
        )}
      </div>
    </div>
  );
};

export default Dock;