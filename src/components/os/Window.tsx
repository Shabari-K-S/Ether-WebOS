import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, Square } from 'lucide-react';
import type { WindowState } from '../../types';
import { useOSStore } from '../../store/osStore';
import { APPS } from '../../constants';

interface WindowProps {
  windowState: WindowState;
}

const Window: React.FC<WindowProps> = ({ windowState }) => {
  const { closeWindow, focusWindow, updateWindowPosition, updateWindowSize, minimizeWindow, maximizeWindow, theme } = useOSStore();

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Resizing state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<string | null>(null);
  const [initialResize, setInitialResize] = useState({ x: 0, y: 0, width: 0, height: 0, mouseX: 0, mouseY: 0 });

  const appConfig = APPS[windowState.appId];
  const AppContent = appConfig.component;
  const windowRef = useRef<HTMLDivElement>(null);

  // Determine current dimensions
  const currentWidth = windowState.size.width || appConfig.defaultWidth;
  const currentHeight = windowState.size.height || appConfig.defaultHeight;

  // Constants
  const MIN_WIDTH = 300;
  const MIN_HEIGHT = 200;
  const MENU_BAR_HEIGHT = 32;

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateWindowPosition(
          windowState.id,
          e.clientX - dragOffset.x,
          e.clientY - dragOffset.y
        );
      } else if (isResizing && resizeDir) {
        e.preventDefault();
        const deltaX = e.clientX - initialResize.mouseX;
        const deltaY = e.clientY - initialResize.mouseY;

        let newWidth = initialResize.width;
        let newHeight = initialResize.height;
        let newX = initialResize.x;
        let newY = initialResize.y;

        if (resizeDir.includes('e')) {
          newWidth = Math.max(MIN_WIDTH, initialResize.width + deltaX);
        }
        if (resizeDir.includes('w')) {
          const w = Math.max(MIN_WIDTH, initialResize.width - deltaX);
          if (w !== initialResize.width) {
            newWidth = w;
            newX = initialResize.x + (initialResize.width - w);
          }
        }
        if (resizeDir.includes('s')) {
          newHeight = Math.max(MIN_HEIGHT, initialResize.height + deltaY);
        }
        if (resizeDir.includes('n')) {
          const h = Math.max(MIN_HEIGHT, initialResize.height - deltaY);
          if (h !== initialResize.height) {
            newHeight = h;
            newY = initialResize.y + (initialResize.height - h);
          }
        }

        updateWindowSize(windowState.id, newWidth, newHeight);
        if (newX !== windowState.position.x || newY !== windowState.position.y) {
          updateWindowPosition(windowState.id, newX, newY);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDir(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragOffset, isResizing, resizeDir, initialResize, windowState.id, updateWindowPosition, updateWindowSize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if not clicking a button/input
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('textarea')) {
      return;
    }
    e.stopPropagation();
    focusWindow(windowState.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - windowState.position.x,
      y: e.clientY - windowState.position.y,
    });
  };

  const handleResizeStart = (e: React.MouseEvent, dir: string) => {
    e.stopPropagation();
    e.preventDefault();
    focusWindow(windowState.id);
    setIsResizing(true);
    setResizeDir(dir);
    setInitialResize({
      x: windowState.position.x,
      y: windowState.position.y,
      width: currentWidth,
      height: currentHeight,
      mouseX: e.clientX,
      mouseY: e.clientY
    });
  };

  if (windowState.isMinimized) return null;

  // Render logic updates
  const renderWidth = windowState.isMaximized ? '100vw' : currentWidth;
  // Calculate height to fill screen minus MenuBar (32px)
  const renderHeight = windowState.isMaximized ? `calc(100vh - ${MENU_BAR_HEIGHT}px)` : currentHeight;
  const renderX = windowState.isMaximized ? 0 : windowState.position.x;
  const renderY = windowState.isMaximized ? MENU_BAR_HEIGHT : windowState.position.y;

  return (
    <div
      ref={windowRef}
      onMouseDown={() => focusWindow(windowState.id)}
      style={{
        transform: `translate(${renderX}px, ${renderY}px)`,
        width: typeof renderWidth === 'number' ? `${renderWidth}px` : renderWidth,
        height: typeof renderHeight === 'number' ? `${renderHeight}px` : renderHeight,
        zIndex: windowState.zIndex,
      }}
      className={`
        absolute flex flex-col shadow-2xl
        ${theme.isDarkMode ? 'bg-[#1e1e1e]/95 text-white border-white/10' : 'bg-white/95 text-black border-black/5'}
        backdrop-blur-xl border transition-shadow duration-200
        ${isDragging ? 'cursor-grabbing' : ''}
        ${windowState.isMaximized ? 'rounded-none border-0' : 'rounded-xl'}
      `}
    >
      {/* Resize Handles - Only when not maximized */}
      {!windowState.isMaximized && (
        <>
          <div onMouseDown={(e) => handleResizeStart(e, 'nw')} className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50" />
          <div onMouseDown={(e) => handleResizeStart(e, 'ne')} className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-50" />
          <div onMouseDown={(e) => handleResizeStart(e, 'sw')} className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50" />
          <div onMouseDown={(e) => handleResizeStart(e, 'se')} className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50" />
          <div onMouseDown={(e) => handleResizeStart(e, 'n')} className="absolute top-0 left-4 right-4 h-2 cursor-n-resize z-40" />
          <div onMouseDown={(e) => handleResizeStart(e, 's')} className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize z-40" />
          <div onMouseDown={(e) => handleResizeStart(e, 'w')} className="absolute top-4 bottom-4 left-0 w-2 cursor-w-resize z-40" />
          <div onMouseDown={(e) => handleResizeStart(e, 'e')} className="absolute top-4 bottom-4 right-0 w-2 cursor-e-resize z-40" />
        </>
      )}

      {/* Conditional Title Bar */}
      {!appConfig.hideTitleBar ? (
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={() => maximizeWindow(windowState.id)}
          className={`
            h-10 flex items-center justify-between px-4 select-none flex-shrink-0
            ${theme.isDarkMode ? 'bg-white/5' : 'bg-black/5'}
            ${isDragging ? 'cursor-grabbing' : 'cursor-default'}
            ${windowState.isMaximized ? '' : 'rounded-t-xl'}
          `}
        >
          <div className="flex space-x-2 group z-20" onMouseDown={e => e.stopPropagation()}>
            <button onClick={() => closeWindow(windowState.id)} className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600"><X size={8} className="opacity-0 group-hover:opacity-100 text-black/50" /></button>
            <button onClick={() => minimizeWindow(windowState.id)} className="w-3 h-3 rounded-full bg-yellow-500 flex items-center justify-center hover:bg-yellow-600"><Minus size={8} className="opacity-0 group-hover:opacity-100 text-black/50" /></button>
            <button onClick={() => maximizeWindow(windowState.id)} className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600"><Square size={8} className="opacity-0 group-hover:opacity-100 text-black/50" /></button>
          </div>
          <div className="font-medium text-sm opacity-70 flex-1 text-center pointer-events-none">{appConfig.name}</div>
          <div className="w-10" />
        </div>
      ) : (
        // Headerless Mode: Controls floating on top left
        <div className={`absolute top-4 left-4 z-50 flex space-x-2 group`}>
          <button onClick={() => closeWindow(windowState.id)} className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 shadow-sm"><X size={8} className="opacity-0 group-hover:opacity-100 text-black/50" /></button>
          <button onClick={() => minimizeWindow(windowState.id)} className="w-3 h-3 rounded-full bg-yellow-500 flex items-center justify-center hover:bg-yellow-600 shadow-sm"><Minus size={8} className="opacity-0 group-hover:opacity-100 text-black/50" /></button>
          <button onClick={() => maximizeWindow(windowState.id)} className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 shadow-sm"><Square size={8} className="opacity-0 group-hover:opacity-100 text-black/50" /></button>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 overflow-hidden relative flex flex-col ${(!windowState.isMaximized && !appConfig.hideTitleBar) ? 'rounded-b-xl' : (windowState.isMaximized ? '' : 'rounded-xl')}`}>
        {(isDragging || isResizing) && <div className="absolute inset-0 z-50 bg-transparent" />}
        <AppContent windowId={windowState.id} onWindowDrag={handleMouseDown} launchArgs={windowState.launchArgs} />
      </div>
    </div>
  );
};

export default Window;