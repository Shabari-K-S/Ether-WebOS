import React, { useState } from 'react';
import { useOSStore } from '../../store/osStore';
import { Folder, FileText, ChevronRight, Home, HardDrive, ArrowLeft } from 'lucide-react';

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
      {/* Sidebar */}
      <div className={`
        w-48 p-4 flex flex-col space-y-4
        ${theme.isDarkMode ? 'bg-white/5' : 'bg-black/5'}
      `}>
        <div className="text-xs font-semibold opacity-50 uppercase mb-2">Favorites</div>
        <button 
          onClick={() => { setCurrentPathId('home'); setHistory([...history, 'home']); }}
          className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-blue-500 hover:text-white transition-colors text-left"
        >
          <Home size={16} />
          <span>Home</span>
        </button>
         <button 
          onClick={() => { setCurrentPathId('root'); setHistory([...history, 'root']); }}
          className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-blue-500 hover:text-white transition-colors text-left"
        >
          <HardDrive size={16} />
          <span>Macintosh HD</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className={`
          h-10 border-b flex items-center px-4 space-x-4
          ${theme.isDarkMode ? 'border-white/10' : 'border-black/10'}
        `}>
          <button 
            onClick={handleBack}
            disabled={history.length <= 1}
            className={`p-1 rounded ${history.length <= 1 ? 'opacity-30' : 'hover:bg-white/10'}`}
          >
            <ArrowLeft size={16} />
          </button>
          <span className="font-semibold">{currentFolder?.name}</span>
        </div>

        {/* File Grid */}
        <div className="flex-1 p-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 content-start">
          {currentFolder?.children?.map((childId) => {
            const node = fileSystem[childId];
            return (
              <div 
                key={childId}
                onDoubleClick={() => handleNavigate(childId)}
                className={`
                  flex flex-col items-center justify-center p-2 rounded cursor-pointer
                  hover:bg-blue-500/20 active:bg-blue-500/40 transition-colors
                `}
              >
                <div className="mb-2 text-blue-400">
                  {node.type === 'folder' ? <Folder size={40} fill="currentColor" fillOpacity={0.2} /> : <FileText size={40} className="text-gray-400" />}
                </div>
                <span className="text-center truncate w-full text-xs">{node.name}</span>
              </div>
            );
          })}
          
          {(!currentFolder?.children || currentFolder.children.length === 0) && (
            <div className="col-span-full flex items-center justify-center h-32 opacity-40">
              Folder is empty
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Finder;