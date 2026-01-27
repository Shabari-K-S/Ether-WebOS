import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, Square } from 'lucide-react';
import type { WindowState } from '../../types';
import { useOSStore } from '../../store/osStore';
import { APPS } from '../../constants';

interface WindowProps {
  windowState: WindowState;
}

const Window: React.FC<WindowProps> = ({ windowState }) => {
  const { closeWindow, focusWindow, updateWindowPosition, minimizeWindow, maximizeWindow, theme } = useOSStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Use config to get initial size/component
  const appConfig = APPS[windowState.appId];
  const AppContent = appConfig.component;

  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        updateWindowPosition(
          windowState.id,
          e.clientX - dragOffset.x,
          e.clientY - dragOffset.y
        );
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragOffset, windowState.id, updateWindowPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if clicking the header
    e.stopPropagation();
    focusWindow(windowState.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - windowState.position.x,
      y: e.clientY - windowState.position.y,
    });
  };

  // Determine current dimensions based on state
  const width = windowState.isMaximized ? '100vw' : windowState.size.width || appConfig.defaultWidth;
  const height = windowState.isMaximized ? 'calc(100vh - 2rem)' : windowState.size.height || appConfig.defaultHeight;
  const x = windowState.isMaximized ? 0 : windowState.position.x;
  const y = windowState.isMaximized ? 32 : windowState.position.y; // 32px is menu bar height

  if (windowState.isMinimized) return null;

  return (
    <div
      ref={windowRef}
      onMouseDown={() => focusWindow(windowState.id)}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        zIndex: windowState.zIndex,
      }}
      className={`
        absolute flex flex-col rounded-xl overflow-hidden shadow-2xl
        ${theme.isDarkMode ? 'bg-[#1e1e1e]/90 text-white border-white/10' : 'bg-white/90 text-black border-black/5'}
        backdrop-blur-xl border transition-shadow duration-200
        ${isDragging ? 'cursor-grabbing' : ''}
      `}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        className={`
          h-10 flex items-center justify-between px-4 select-none cursor-default
          ${theme.isDarkMode ? 'bg-white/5' : 'bg-black/5'}
        `}
      >
        <div className="flex space-x-2 group">
          <button
            onClick={(e) => { e.stopPropagation(); closeWindow(windowState.id); }}
            className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X size={8} className="opacity-0 group-hover:opacity-100 text-black/50" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); minimizeWindow(windowState.id); }}
            className="w-3 h-3 rounded-full bg-yellow-500 flex items-center justify-center hover:bg-yellow-600 transition-colors"
          >
            <Minus size={8} className="opacity-0 group-hover:opacity-100 text-black/50" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); maximizeWindow(windowState.id); }}
            className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors"
          >
            <Square size={8} className="opacity-0 group-hover:opacity-100 text-black/50" />
          </button>
        </div>
        <div className="font-medium text-sm opacity-70 flex-1 text-center">
          {appConfig.name}
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto relative">
        <AppContent windowId={windowState.id} />
      </div>
    </div>
  );
};

export default Window;