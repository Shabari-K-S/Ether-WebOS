import React, { useRef } from 'react';
import { useOSStore } from '../../store/osStore';
import { APPS } from '../../constants';

const Dock: React.FC = () => {
  const { launchApp, theme } = useOSStore();
  const dockRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const dock = dockRef.current;
    if (!dock) return;

    // Simple scale effect based on cursor distance logic can be added here
    // For this version, we use CSS hover transitions for reliability
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div
        ref={dockRef}
        onMouseMove={handleMouseMove}
        className={`
          flex items-end space-x-2 px-4 pb-3 pt-3 rounded-2xl
          ${theme.isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white/30 border-white/20'}
          backdrop-blur-2xl border shadow-2xl transition-all duration-300
        `}
      >
        {Object.values(APPS).map((app) => (
          <button
            key={app.id}
            onClick={() => launchApp(app.id)}
            className="group relative flex flex-col items-center justify-end transition-all duration-200 ease-out hover:-translate-y-2 hover:scale-125 origin-bottom p-1"
          >
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center shadow-lg
              bg-gradient-to-br from-gray-700 to-black text-white
              ${app.id === 'finder' ? 'from-blue-400 to-blue-600' : ''}
              ${app.id === 'settings' ? 'from-gray-300 to-gray-500' : ''}
              ${app.id === 'genius' ? 'from-purple-400 to-indigo-600' : ''}
              ${app.id === 'terminal' ? 'from-gray-800 to-black' : ''}
            `}>
              <app.icon size={28} />
            </div>
            {/* Tooltip */}
            <span className={`
              absolute -top-10 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 
              group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-md
            `}>
              {app.name}
            </span>
            {/* Active Indicator (Mock) */}
            <div className="w-1 h-1 bg-white/50 rounded-full mt-1 opacity-0 group-active:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dock;