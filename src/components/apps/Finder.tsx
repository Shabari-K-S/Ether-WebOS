import React, { useState, useRef, useEffect } from 'react';
import { useOSStore } from '../../store/osStore';
import { Folder, FileText, Home, HardDrive, ArrowLeft } from 'lucide-react';
import type { ContextMenuItem } from '../os/ContextMenu';
import ContextMenu from '../os/ContextMenu';

interface FinderProps {
  windowId: string;
}

const Finder: React.FC<FinderProps> = () => {
  const { fileSystem, theme, renameNode, launchApp } = useOSStore();
  const [currentPathId, setCurrentPathId] = useState<string>('home');
  const [history, setHistory] = useState<string[]>(['home']);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);

  // Renaming State
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  const currentFolder = fileSystem[currentPathId];

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const handleNavigate = (id: string) => {
    // Don't navigate if renaming
    if (renamingId) return;

    if (fileSystem[id]?.type === 'folder') {
      setHistory([...history, id]);
      setCurrentPathId(id);
    } else if (fileSystem[id]?.type === 'file') {
      const node = fileSystem[id];
      if (node.name.endsWith('.txt')) {
        launchApp('notes', { fileId: id });
      } else {
        // Default handling for other files (maybe future preview)
        alert(`Cannot open ${node.name} yet.`);
      }
    }
  };

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
      setCurrentPathId(newHistory[newHistory.length - 1]);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent desktop context menu

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          label: 'Rename',
          action: () => {
            setRenamingId(id);
            setTempName(fileSystem[id].name);
          }
        },
        // Future: Delete, Get Info, etc.
      ]
    });
  };

  const handleRenameSave = () => {
    if (renamingId && tempName.trim()) {
      renameNode(renamingId, tempName.trim());
    }
    setRenamingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSave();
    } else if (e.key === 'Escape') {
      setRenamingId(null);
    }
  };

  // Close context menu on click
  const handleClick = () => {
    if (contextMenu) setContextMenu(null);
  };

  return (
    <div className="flex h-full text-sm" onClick={handleClick}>
      {/* Sidebar - Fixed width, shrink-0 prevents it from being squashed */}
      <div className={`
        w-48 flex-shrink-0 flex flex-col space-y-4 p-4 border-r overflow-y-auto
        ${theme.isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}
      `}>
        <div className="text-xs font-semibold opacity-50 uppercase mb-2">Favorites</div>
        <button
          onClick={() => { setCurrentPathId('home'); setHistory([...history, 'home']); }}
          className={`flex items-center space-x-2 px-2 py-1.5 rounded transition-colors text-left ${currentPathId === 'home' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10'}`}
        >
          <Home size={16} />
          <span>Home</span>
        </button>
        <button
          onClick={() => { setCurrentPathId('root'); setHistory([...history, 'root']); }}
          className={`flex items-center space-x-2 px-2 py-1.5 rounded transition-colors text-left ${currentPathId === 'root' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10'}`}
        >
          <HardDrive size={16} />
          <span>Macintosh HD</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        {/* Toolbar - Fixed height */}
        <div className={`
          h-12 border-b flex items-center px-4 space-x-4 flex-shrink-0
          ${theme.isDarkMode ? 'border-white/10' : 'border-black/10'}
        `}>
          <button
            onClick={handleBack}
            disabled={history.length <= 1}
            className={`p-1.5 rounded transition-colors ${history.length <= 1 ? 'opacity-30' : 'hover:bg-white/10'}`}
          >
            <ArrowLeft size={16} />
          </button>
          <span className="font-semibold text-base">{currentFolder?.name}</span>
        </div>

        {/* File Grid - Scrollable area with responsive grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-4">
            {currentFolder?.children?.map((childId) => {
              const node = fileSystem[childId];
              const isRenaming = renamingId === childId;

              return (
                <div
                  key={childId}
                  onDoubleClick={() => handleNavigate(childId)}
                  onContextMenu={(e) => handleContextMenu(e, childId)}
                  className={`
                    flex flex-col items-center justify-start p-2 rounded-lg cursor-pointer
                    hover:bg-blue-500/20 active:bg-blue-500/40 transition-colors
                    aspect-square group
                  `}
                >
                  <div className="mb-2 text-blue-400 flex-1 flex items-center justify-center pointer-events-none">
                    {node.type === 'folder' ? <Folder size={48} fill="currentColor" fillOpacity={0.2} /> : <FileText size={48} className="text-gray-400" />}
                  </div>

                  {isRenaming ? (
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={handleRenameSave}
                      onKeyDown={handleKeyDown}
                      onClick={(e) => e.stopPropagation()}
                      className="text-center w-full text-xs bg-white text-black rounded px-1 outline-none border border-blue-500"
                    />
                  ) : (
                    <span className="text-center w-full text-xs truncate px-1 group-hover:text-blue-200 select-none">
                      {node.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {(!currentFolder?.children || currentFolder.children.length === 0) && (
            <div className="flex items-center justify-center h-full opacity-40">
              Folder is empty
            </div>
          )}
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default Finder;