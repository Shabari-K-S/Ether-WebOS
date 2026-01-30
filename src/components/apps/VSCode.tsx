import React, { useState, useMemo, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useOSStore } from '../../store/osStore';
import { TreeView, type TreeNode } from '../ui/TreeView';
import ContextMenu, { type ContextMenuItem } from '../os/ContextMenu';
import {
    FileCode,
    FileJson,
    FileType,
    FileImage,
    Settings,
    Search,
    GitGraph,
    X,
    LayoutTemplate,
    Terminal,
    ChevronDown,
    ChevronUp,
    FileText,
    FolderPlus,
    FilePlus,
    Edit2,
    Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { TerminalCore } from './Terminal';

interface VSCodeProps {
    windowId: string;
    onWindowDrag?: (e: React.MouseEvent) => void;
}

const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'ts': case 'tsx': return <FileCode className="w-4 h-4 text-[#3178c6]" />;
        case 'js': case 'jsx': return <FileCode className="w-4 h-4 text-[#f1e05a]" />;
        case 'json': return <FileJson className="w-4 h-4 text-[#f1e05a]" />;
        case 'css': return <FileType className="w-4 h-4 text-[#563d7c]" />;
        case 'html': return <FileCode className="w-4 h-4 text-[#e34c26]" />;
        case 'md': return <FileText className="w-4 h-4 text-[#cccccc]" />;
        case 'png': case 'jpg': case 'webp': return <FileImage className="w-4 h-4 text-[#a074c4]" />;
        default: return <FileCode className="w-4 h-4 text-[#cccccc]" />;
    }
};

const VSCode: React.FC<VSCodeProps> = ({ windowId: _, onWindowDrag }) => {
    const { fileSystem, updateFileContent, createFile, createFolder, deleteNode, renameNode } = useOSStore();
    const [activeTabId, setActiveTabId] = useState<string | null>(null);
    const [openFiles, setOpenFiles] = useState<string[]>([]);
    const [sidebarVisible] = useState(true);

    // Feature States
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const [terminalCwd, setTerminalCwd] = useState('home');
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);
    const [explorerRoot, setExplorerRoot] = useState('home');

    // Terminal Resizing
    const [terminalHeight, setTerminalHeight] = useState(240);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;
            // Calculate height from the bottom of the container
            const containerBottom = containerRef.current.getBoundingClientRect().bottom;
            const newHeight = containerBottom - e.clientY;
            const containerHeight = containerRef.current.clientHeight;

            // Constrain
            if (newHeight > 100 && newHeight < containerHeight - 50) {
                setTerminalHeight(newHeight);
            }
        };
        const handleMouseUp = () => setIsResizing(false);

        if (isResizing) {
            document.body.style.cursor = 'ns-resize';
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            document.body.style.cursor = '';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
        };
    }, [isResizing]);

    const treeData = useMemo(() => {
        const buildTree = (nodeId: string): TreeNode | null => {
            const node = fileSystem[nodeId];
            if (!node) return null;
            const treeNode: TreeNode = { id: node.id, label: node.name, type: node.type, children: [] };
            if (node.type === 'file') treeNode.icon = getFileIcon(node.name);
            if (node.type === 'folder' && node.children) {
                treeNode.children = node.children
                    .map(childId => buildTree(childId))
                    .filter(Boolean) as TreeNode[];
                treeNode.children.sort((a, b) => {
                    if (a.type === b.type) return a.label.localeCompare(b.label);
                    return a.type === 'folder' ? -1 : 1;
                });
            }
            return treeNode;
        };
        const rootNode = buildTree(explorerRoot);
        return rootNode ? (explorerRoot === 'root' ? [rootNode] : rootNode.children || []) : [];
    }, [fileSystem, explorerRoot]);

    const handleFileSelect = (node: TreeNode) => {
        if (node.type === 'file') {
            if (!openFiles.includes(node.id)) setOpenFiles([...openFiles, node.id]);
            setActiveTabId(node.id);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, node: TreeNode) => {
        e.preventDefault();
        e.stopPropagation();

        const items: ContextMenuItem[] = [];

        if (node.type === 'folder') {
            items.push(
                {
                    label: 'New File', icon: <FilePlus size={14} />, action: () => {
                        const name = prompt('File Name:');
                        if (name) createFile(node.id, name, '');
                    }
                },
                {
                    label: 'New Folder', icon: <FolderPlus size={14} />, action: () => {
                        const name = prompt('Folder Name:');
                        if (name) createFolder(node.id, name);
                    }
                },
                { separator: true },
                {
                    label: 'Open in Integrated Terminal', icon: <Terminal size={14} />, action: () => {
                        setTerminalCwd(node.id);
                        setIsTerminalOpen(true);
                    }
                }
            );
        } else {
            items.push({ label: 'Open', action: () => handleFileSelect(node) });
        }

        items.push(
            { separator: true },
            {
                label: 'Rename', icon: <Edit2 size={14} />, action: () => {
                    const newName = prompt('New Name:', node.label);
                    if (newName) renameNode(node.id, newName);
                }
            },
            {
                label: 'Delete', danger: true, icon: <Trash2 size={14} />, action: () => {
                    if (confirm(`Delete ${node.label}?`)) {
                        deleteNode(node.id);
                        if (openFiles.includes(node.id)) {
                            const newOpen = openFiles.filter(id => id !== node.id);
                            setOpenFiles(newOpen);
                            if (activeTabId === node.id) setActiveTabId(newOpen[0] || null);
                        }
                    }
                }
            }
        );

        setContextMenu({ x: e.clientX, y: e.clientY, items });
    };

    const handleCloseTab = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newOpenFiles = openFiles.filter(fileId => fileId !== id);
        setOpenFiles(newOpenFiles);
        if (activeTabId === id) setActiveTabId(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
    };

    const activeFile = activeTabId ? fileSystem[activeTabId] : null;

    const getLanguage = (filename: string) => {
        if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
        if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
        if (filename.endsWith('.css')) return 'css';
        if (filename.endsWith('.html')) return 'html';
        if (filename.endsWith('.json')) return 'json';
        return 'plaintext';
    };

    // Close context menu on global click
    useEffect(() => {
        const closeMenu = () => setContextMenu(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    return (
        <div ref={containerRef} className="flex flex-col h-full w-full bg-[#1e1e1e] text-[#cccccc] font-sans selection:bg-[#264f78] overflow-hidden rounded-lg border border-[#2b2b2b]">
            {/* Custom Title Bar */}
            <div className="h-[35px] bg-[#18181b] flex items-center justify-between relative select-none border-b border-[#2b2b2b] pr-2" onMouseDown={onWindowDrag}>
                {/* Left Side: Traffic Lights Placeholder + Menu */}
                <div className="flex items-center min-w-0 z-20 bg-[#18181b] pr-4 rounded-r-xl">
                    <div className="w-[70px] shrink-0" /> {/* Spacer for OS Traffic Lights */}
                    <div className="flex items-center space-x-0.5 text-[#cccccc] opacity-80 text-xs shrink-0">
                        <span
                            className="hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-[#ffffff1a] transition-colors whitespace-nowrap"
                            onClick={(e) => {
                                e.stopPropagation();
                                const name = prompt('Simulated "Open Folder" - Enter Path (root, home, docs):', explorerRoot);
                                if (name && fileSystem[name]) setExplorerRoot(name);
                            }}
                            title="Click to Open Folder"
                        >File</span>
                        {['Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'].map(m => (
                            <span key={m} className="hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-[#ffffff1a] transition-colors whitespace-nowrap">{m}</span>
                        ))}
                    </div>
                </div>

                {/* Center Title - Absolute Centered but lower z-index */}
                <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none z-10 px-[320px]">
                    <span className="text-xs text-[#9d9d9d] font-medium truncate opacity-90">
                        {activeFile ? `${activeFile.name} - ` : ''} {fileSystem[explorerRoot]?.name || 'Ether'} - Visual Studio Code
                    </span>
                </div>

                {/* Right Side: Toggles */}
                <div className="flex items-center pl-2 z-20 bg-[#18181b]">
                    <div
                        className={cn("p-1.5 rounded hover:bg-[#ffffff1a] cursor-pointer transition-colors", isTerminalOpen && "bg-[#ffffff1a] text-white")}
                        onClick={() => setIsTerminalOpen(p => !p)}
                        title="Toggle Terminal (Ctrl+`)"
                    >
                        <LayoutTemplate size={14} />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Activity Bar */}
                <div className="w-12 bg-[#18181b] flex flex-col items-center py-2 space-y-2 border-r border-[#2b2b2b] z-10">
                    <div className="p-3 cursor-pointer text-white border-l-2 border-white"><FileCode size={24} strokeWidth={1.5} /></div>
                    <div className="p-3 cursor-pointer text-[#858585] hover:text-white transition-colors"><Search size={24} strokeWidth={1.5} /></div>
                    <div className="p-3 cursor-pointer text-[#858585] hover:text-white transition-colors"><GitGraph size={24} strokeWidth={1.5} /></div>
                    <div className="flex-1" />
                    <div className="p-3 cursor-pointer text-[#858585] hover:text-white transition-colors"><Settings size={24} strokeWidth={1.5} /></div>
                </div>

                {/* Sidebar */}
                {sidebarVisible && (
                    <div className="w-64 bg-[#18181b] flex flex-col border-r border-[#2b2b2b] flex-shrink-0">
                        <div className="px-5 py-2.5 text-[11px] font-bold text-[#bbbbbb] flex justify-between items-center tracking-wider uppercase">
                            <span>Explorer</span>
                            <span className="cursor-pointer hover:bg-[#313131] p-0.5 rounded">...</span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {/* Accordion Item: Open Editors */}
                            <div className="group">
                                <div className="flex items-center px-1 py-1 text-xs font-bold text-[#bbbbbb] cursor-pointer hover:bg-[#2a2d2e] transition-colors">
                                    <ChevronDown size={14} className="mr-1" /> OPEN EDITORS
                                </div>
                            </div>

                            {/* Accordion Item: Project Folder */}
                            <div>
                                <div className="flex items-center px-1 py-1 text-xs font-bold text-[#bbbbbb] cursor-pointer hover:bg-[#2a2d2e] transition-colors">
                                    <ChevronDown size={14} className="mr-1" /> {fileSystem[explorerRoot]?.name.toUpperCase() || 'WORKSPACE'}
                                </div>
                                <div className="pl-0" onContextMenu={(e) => {
                                    handleContextMenu(e, { id: explorerRoot, label: 'Root', type: 'folder' } as any);
                                }}>
                                    <TreeView
                                        data={treeData}
                                        onSelect={handleFileSelect}
                                        onContextMenu={handleContextMenu}
                                        className="bg-transparent border-none p-0 ml-1"
                                        defaultExpanded={['home', 'docs']}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#1f1f1f]">
                    {/* Tabs */}
                    {openFiles.length > 0 ? (
                        <div className="flex bg-[#18181b] overflow-x-auto scrollbar-hide h-[35px]">
                            {openFiles.map(fileId => {
                                const file = fileSystem[fileId];
                                if (!file) return null;
                                const isActive = activeTabId === fileId;
                                return (
                                    <div
                                        key={fileId}
                                        onClick={() => setActiveTabId(fileId)}
                                        className={cn(
                                            "flex items-center px-3 min-w-[120px] max-w-[200px] text-xs cursor-pointer border-r border-[#2b2b2b] group select-none transition-colors",
                                            isActive ? "bg-[#1f1f1f] text-white border-t-2 border-t-[#007acc]" : "bg-[#2d2d2d]/30 text-[#969696] hover:bg-[#2d2d2d]/50"
                                        )}
                                    >
                                        <span className="mr-2">{getFileIcon(file.name)}</span>
                                        <span className="truncate flex-1 font-medium">{file.name}</span>
                                        <button onClick={(e) => handleCloseTab(e, fileId)} className={cn("ml-2 p-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity", isActive ? "text-white hover:bg-[#4b5563]" : "text-[#969696] hover:bg-[#4b5563] hover:text-white")}><X size={14} /></button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-[35px] bg-[#1f1f1f] border-b border-[#2b2b2b]" />
                    )}

                    {/* Breadcrumbs */}
                    {activeFile && (
                        <div className="h-[22px] bg-[#1f1f1f] flex items-center px-4 text-xs text-[#969696] select-none shadow-sm">
                            <span className="hover:text-[#cccccc] cursor-pointer">src</span>
                            <span className="mx-1">›</span>
                            <span className="text-[#cccccc] flex items-center gap-1">{getFileIcon(activeFile.name)} {activeFile.name}</span>
                        </div>
                    )}

                    {/* Editor */}
                    <div className="flex-1 relative bg-[#1f1f1f] min-h-0 overflow-hidden">
                        {activeTabId && activeFile ? (
                            <Editor
                                height="100%"
                                theme="vs-dark"
                                path={activeFile.name}
                                defaultLanguage={getLanguage(activeFile.name)}
                                defaultValue={activeFile.content || ''}
                                value={activeFile.content}
                                onChange={(val) => val !== undefined && updateFileContent(activeTabId, val)}
                                options={{
                                    minimap: { enabled: true },
                                    fontSize: 14,
                                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 16 },
                                    lineNumbers: 'on',
                                    renderLineHighlight: 'all',
                                    contextmenu: true
                                }}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-[#3b3b3b] select-none">
                                <div className="text-8xl mb-6 opacity-10">
                                    <FileCode strokeWidth={1} />
                                </div>
                                <div className="text-[#cccccc] text-xs space-y-4 text-center opacity-60">
                                    <p className="font-semibold text-sm">Ether OS Simulator</p>
                                    <div className="grid grid-cols-[1fr_auto] gap-x-8 gap-y-2 text-left text-[11px] max-w-md mx-auto">
                                        <span>Show All Commands</span><span className="text-[#858585]">Ctrl+Shift+P</span>
                                        <span>Go to File</span><span className="text-[#858585]">Ctrl+P</span>
                                        <span>Toggle Terminal</span><span className="text-[#858585]">Ctrl+`</span>
                                        <span>Find in Files</span><span className="text-[#858585]">Ctrl+Shift+F</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Integrated Terminal Panel */}
                    {isTerminalOpen && (
                        <div
                            style={{ height: terminalHeight }}
                            className="flex flex-col border-t border-[#2b2b2b] bg-[#1e1e1e] relative group w-full"
                        >
                            {/* Resize Handle */}
                            <div
                                className="absolute -top-1 left-0 right-0 h-2 cursor-ns-resize z-50 bg-transparent hover:bg-blue-500/50 transition-colors"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    setIsResizing(true);
                                }}
                            />

                            <div className="flex items-center justify-between px-3 h-[28px] text-[11px] text-[#cccccc] uppercase tracking-wider font-bold bg-[#1e1e1e] border-b border-[#2b2b2b] select-none">
                                <div className="flex gap-4 h-full">
                                    <span className="border-b border-[#e7e7e7] text-white cursor-pointer h-full flex items-center px-1">Terminal</span>
                                    <span className="opacity-50 hover:opacity-100 cursor-pointer h-full flex items-center px-1 transition-opacity">Output</span>
                                    <span className="opacity-50 hover:opacity-100 cursor-pointer h-full flex items-center px-1 transition-opacity">Debug Console</span>
                                    <span className="opacity-50 hover:opacity-100 cursor-pointer h-full flex items-center px-1 transition-opacity">Problems</span>
                                </div>
                                <div className="flex items-center gap-3 text-[#cccccc]">
                                    <div className="cursor-pointer hover:text-white" onClick={() => setTerminalHeight(h => h === 240 ? 400 : 240)} title="Toggle Maximize">
                                        {terminalHeight > 300 ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                    </div>
                                    <div title="Close Panel" onClick={() => setIsTerminalOpen(false)} className="cursor-pointer hover:text-white transition-colors">
                                        <X size={14} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden relative pl-2 pt-1">
                                <TerminalCore
                                    className="h-full bg-[#1e1e1e] p-2 text-[#cccccc] text-[13px]"
                                    cwd={terminalCwd}
                                    onCd={setTerminalCwd}
                                    showWatermark={false}
                                />
                            </div>
                        </div>
                    )}

                    {/* Status Bar */}
                    <div className="h-[22px] bg-[#007acc] text-white flex items-center px-3 text-[11px] justify-between select-none z-10 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 hover:bg-white/20 px-1 rounded cursor-pointer"><GitGraph size={10} /><span>main*</span></div>
                            <div className="hover:bg-white/20 px-1 rounded cursor-pointer">0 ⊗ 0 ⚠</div>
                        </div>
                        <div className="flex items-center gap-3">
                            {activeFile && <span className="hover:bg-white/20 px-1 rounded cursor-pointer">{getLanguage(activeFile.name).toUpperCase()}</span>}
                            <span className="hover:bg-white/20 px-1 rounded cursor-pointer">Prettier</span>
                            <span className="hover:bg-white/20 px-1 rounded cursor-pointer">Ln 12, Col 42</span>
                            <span className="hover:bg-white/20 px-1 rounded cursor-pointer">Spaces: 4</span>
                            <span className="hover:bg-white/20 px-1 rounded cursor-pointer">UTF-8</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Context Menu Portal */}
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

export default VSCode;
