import React, { useState, useEffect, useRef } from 'react';
import { useOSStore } from '../../store/osStore';
import { APPS } from '../../constants';
import { Search, Folder as FolderIcon, ChevronLeft } from 'lucide-react';
import type { ContextMenuItem } from './ContextMenu';
import ContextMenu from './ContextMenu';
import type { AppID, LauncherFolder } from '../../types';

const AppLauncher: React.FC = () => {
    const {
        isLauncherOpen, launchApp, setLauncherOpen, theme,
        launcherItems, createLauncherFolder, addAppToLauncherFolder,
        removeAppFromLauncherFolder, renameLauncherFolder, deleteLauncherFolder
    } = useOSStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [openFolderId, setOpenFolderId] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, items: ContextMenuItem[] } | null>(null);
    const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
    const [tempFolderName, setTempFolderName] = useState('');
    const renameInputRef = useRef<HTMLInputElement>(null);

    // Handle animation timing
    useEffect(() => {
        if (isLauncherOpen) {
            setIsVisible(true);
            setSearchTerm('');
            setOpenFolderId(null);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isLauncherOpen]);

    // Handle Escape key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isLauncherOpen) {
                if (openFolderId) {
                    setOpenFolderId(null);
                } else {
                    setLauncherOpen(false);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLauncherOpen, setLauncherOpen, openFolderId]);

    useEffect(() => {
        if (renamingFolderId && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [renamingFolderId]);

    if (!isVisible) return null;

    const folders = launcherItems.filter(i => i.type === 'folder') as LauncherFolder[];

    const handleBackgroundContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            items: [
                {
                    label: 'New Folder',
                    action: () => createLauncherFolder('New Folder')
                }
            ]
        });
    };

    const handleAppContextMenu = (e: React.MouseEvent, appId: AppID, fromFolderId?: string) => {
        e.preventDefault();
        e.stopPropagation();

        const items: ContextMenuItem[] = [];

        if (fromFolderId) {
            items.push({
                label: 'Remove from Folder',
                action: () => removeAppFromLauncherFolder(fromFolderId, appId)
            });
        } else {
            const availableFolders = folders;
            if (availableFolders.length > 0) {
                availableFolders.forEach(f => {
                    items.push({
                        label: `Move to ${f.name}`,
                        action: () => addAppToLauncherFolder(f.id, appId)
                    });
                });
            }
        }

        items.push({ separator: true });
        items.push({
            label: 'New Folder',
            action: () => createLauncherFolder('New Folder')
        });

        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            items
        });
    };

    const handleFolderContextMenu = (e: React.MouseEvent, folderId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            items: [
                {
                    label: 'Rename Folder',
                    action: () => {
                        const folder = folders.find(f => f.id === folderId);
                        if (folder) {
                            setRenamingFolderId(folderId);
                            setTempFolderName(folder.name);
                        }
                    }
                },
                {
                    label: 'Delete Folder',
                    danger: true,
                    action: () => deleteLauncherFolder(folderId)
                },
                { separator: true },
                {
                    label: 'New Folder',
                    action: () => createLauncherFolder('New Folder')
                }
            ]
        });
    };

    const handleRenameSave = () => {
        if (renamingFolderId && tempFolderName.trim()) {
            renameLauncherFolder(renamingFolderId, tempFolderName.trim());
        }
        setRenamingFolderId(null);
    };

    const filteredItems = launcherItems.filter(item => {
        if (searchTerm) {
            if (item.type === 'app') {
                return APPS[item.id].name.toLowerCase().includes(searchTerm.toLowerCase());
            } else {
                // Return folder if any app inside matches
                return item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.appIds.some(id => APPS[id].name.toLowerCase().includes(searchTerm.toLowerCase()));
            }
        }
        return true;
    });

    const openFolder = openFolderId ? folders.find(f => f.id === openFolderId) : null;

    const renderApp = (appId: AppID, fromFolderId?: string) => {
        const app = APPS[appId];
        if (!app) return null;

        return (
            <button
                key={appId}
                onClick={() => {
                    launchApp(appId);
                    setLauncherOpen(false);
                }}
                onContextMenu={(e) => handleAppContextMenu(e, appId, fromFolderId)}
                className="group flex flex-col items-center gap-4 transition-all duration-200 hover:scale-110"
            >
                <div className={`
                    w-20 h-20 md:w-24 md:h-24 rounded-[22px] flex items-center justify-center shadow-2xl transition-all duration-200
                    ${typeof app.icon !== 'string' ? 'bg-zinc-200 to-br from-gray-300 to-gray-600 text-black' : 'bg-transparent'}
                `}>
                    {typeof app.icon === 'string' ? (
                        <img src={app.icon} alt={app.name} className="w-full h-full object-contain drop-shadow-md" />
                    ) : (
                        React.createElement(app.icon, { size: 48 })
                    )}
                </div>
                <span className={`text-sm font-medium tracking-wide shadow-black drop-shadow-md text-white px-2 text-center`}>
                    {app.name}
                </span>
            </button>
        );
    };

    const renderFolder = (folder: LauncherFolder) => {
        const isRenaming = renamingFolderId === folder.id;

        return (
            <div
                key={folder.id}
                className="group flex flex-col items-center gap-2 transition-all duration-200"
            >
                <button
                    onClick={() => setOpenFolderId(folder.id)}
                    onContextMenu={(e) => handleFolderContextMenu(e, folder.id)}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-[22px] bg-white/20 backdrop-blur-2xl border border-white/30 grid grid-cols-3 gap-1.5 p-3 shadow-2xl transition-all duration-200 hover:scale-105 hover:bg-white/30 overflow-hidden"
                >
                    {folder.appIds.length === 0 ? (
                        <div className="col-span-3 row-span-3 flex items-center justify-center">
                            <FolderIcon size={32} className="text-white/40" />
                        </div>
                    ) : (
                        folder.appIds.slice(0, 9).map((appId) => {
                            const app = APPS[appId];
                            return (
                                <div key={appId} className="w-full aspect-square rounded-[6px] overflow-hidden bg-white/10 shadow-sm flex items-center justify-center">
                                    {typeof app.icon === 'string' ? (
                                        <img src={app.icon} alt="" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-400">
                                            {React.createElement(app.icon, { size: 12 })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </button>
                {isRenaming ? (
                    <input
                        ref={renameInputRef}
                        type="text"
                        value={tempFolderName}
                        onChange={(e) => setTempFolderName(e.target.value)}
                        onBlur={handleRenameSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameSave()}
                        className="bg-white/20 border-none outline-none text-sm font-medium text-center rounded px-2 py-0.5 text-white w-24"
                    />
                ) : (
                    <span className="text-sm font-medium tracking-wide shadow-black drop-shadow-md text-white">
                        {folder.name}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div
            className={`
                fixed inset-0 z-[60] flex flex-col items-center justify-start pt-24
                transition-all duration-300 ease-in-out
                ${isLauncherOpen ? 'opacity-100 scale-100 backdrop-blur-2xl bg-black/40' : 'opacity-0 scale-110 pointer-events-none'}
            `}
            onClick={(e) => e.target === e.currentTarget && setLauncherOpen(false)}
            onContextMenu={handleBackgroundContextMenu}
        >
            {/* Search Bar */}
            <div
                className={`w-full max-w-md mb-16 relative transform transition-all duration-500 ${openFolderId ? 'opacity-0 scale-95 pointer-events-none' : ''}`}
                onClick={e => e.stopPropagation()}
            >
                <div className={`
                    flex items-center px-4 py-3 rounded-2xl border shadow-2xl
                    ${theme.isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white/80 border-white/40 text-black'}
                    backdrop-blur-md
                `}>
                    <Search size={20} className="opacity-50 mr-3" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-lg w-full placeholder-opacity-50"
                        autoFocus={!openFolderId}
                    />
                </div>
            </div>

            {/* App Grid */}
            <div
                className={`
                    grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-8 md:gap-12 max-w-5xl px-8
                    transition-all duration-500
                    ${openFolderId ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}
                `}
                onClick={e => e.stopPropagation()}
                onContextMenu={handleBackgroundContextMenu}
            >
                {filteredItems.map((item) => (
                    item.type === 'app' ? renderApp(item.id) : renderFolder(item)
                ))}
            </div>

            {/* Folder View Overlay */}
            {openFolder && (
                <div
                    className="absolute inset-0 z-[70] flex flex-col items-center justify-center p-8 transition-all duration-300 animate-in fade-in zoom-in-95"
                    onClick={(e) => { e.stopPropagation(); setOpenFolderId(null); }}
                >
                    <div
                        className="w-full max-w-4xl bg-white/10 backdrop-blur-3xl rounded-[40px] border border-white/20 p-12 shadow-2xl relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setOpenFolderId(null)}
                            className="absolute top-8 left-8 p-2 rounded-full hover:bg-white/10 text-white flex items-center gap-2"
                        >
                            <ChevronLeft size={24} />
                            <span className="font-medium">Back</span>
                        </button>

                        <div className="flex flex-col items-center gap-12">
                            <h2 className="text-4xl font-semibold text-white mt-4">{openFolder.name}</h2>
                            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-8 w-full justify-items-center">
                                {openFolder.appIds.map(appId => renderApp(appId, openFolder.id))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {filteredItems.length === 0 && !openFolderId && (
                <div className="text-white/50 text-xl font-light mt-10">No applications found</div>
            )}

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

export default AppLauncher;