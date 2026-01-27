import React, { useState } from 'react';
import { useOSStore } from '../../store/osStore';
import { Folder, FileText, Home, HardDrive, ArrowLeft } from 'lucide-react';

interface FinderProps {
  windowId: string;
}

const Finder: React.FC<FinderProps> = () => {
  const { fileSystem, theme } = useOSStore();
  const [currentPathId, setCurrentPathId] = useState<string>('home');
  const [history, setHistory] = useState<string[]>(['home']);

  const currentFolder = fileSystem[currentPathId];

  const handleNavigate = (id: string) => {
    if (fileSystem[id]?.type === 'folder') {
      setHistory([...history, id]);
      setCurrentPathId(id);
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

  return (
    <div className="flex h-full text-sm">
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
              return (
                <div
                  key={childId}
                  onDoubleClick={() => handleNavigate(childId)}
                  className={`
                    flex flex-col items-center justify-start p-2 rounded-lg cursor-pointer
                    hover:bg-blue-500/20 active:bg-blue-500/40 transition-colors
                    aspect-square
                  `}
                >
                  <div className="mb-2 text-blue-400 flex-1 flex items-center justify-center">
                    {node.type === 'folder' ? <Folder size={48} fill="currentColor" fillOpacity={0.2} /> : <FileText size={48} className="text-gray-400" />}
                  </div>
                  <span className="text-center w-full text-xs truncate px-1">{node.name}</span>
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
    </div>
  );
};

export default Finder;