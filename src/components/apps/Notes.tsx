import React, { useState, useEffect } from 'react';
import { useOSStore } from '../../store/osStore';
import type { AppProps } from '../../types';
import { Plus, Trash2, FileText } from 'lucide-react';

const Notes: React.FC<AppProps> = ({ onWindowDrag, launchArgs }) => {
    const { fileSystem, createFile, updateFileContent, deleteNode, renameNode, theme } = useOSStore();
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

    // Get 'docs' folder children
    const docsFolder = fileSystem['docs'];
    const defaultNotes = docsFolder?.children
        ?.map(id => fileSystem[id])
        .filter(node => node.type === 'file') || [];

    // If active note is not in defaultNotes (e.g. opened from Desktop), add it to the list for visibility
    const notes = [...defaultNotes];
    if (activeNoteId && !notes.find(n => n.id === activeNoteId)) {
        const activeNode = fileSystem[activeNoteId];
        if (activeNode) {
            notes.unshift(activeNode); // Add to top
        }
    }

    // Auto-select note from launchArgs or first note
    useEffect(() => {
        if (launchArgs?.fileId) {
            setActiveNoteId(launchArgs.fileId);
        } else if (!activeNoteId && notes.length > 0) {
            setActiveNoteId(notes[0].id);
        }
    }, [launchArgs?.fileId, notes.length, activeNoteId]);

    const handleCreateNote = () => {
        const newId = createFile('docs', `Note ${notes.length + 1}.txt`, '');
        setActiveNoteId(newId);
    };

    const handleDeleteNote = (id: string) => {
        deleteNode(id);
        if (activeNoteId === id) {
            setActiveNoteId(null);
        }
    };

    const activeNote = activeNoteId ? fileSystem[activeNoteId] : null;

    return (
        <div className={`flex h-full ${theme.isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {/* Sidebar */}
            <div className={`w-48 border-r flex flex-col ${theme.isDarkMode ? 'bg-[#2a2a2a] border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                <div
                    onMouseDown={onWindowDrag}
                    className="h-10 flex items-center justify-between px-3 border-b border-inherit select-none"
                >
                    <span className="font-semibold text-xs opacity-70">ICLOUD NOTES</span>
                    <button onClick={handleCreateNote} className="hover:bg-gray-400/20 p-1 rounded transition-colors">
                        <Plus size={14} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {notes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => setActiveNoteId(note.id)}
                            className={`
                 p-3 border-b border-inherit cursor-pointer flex justify-between group
                 ${activeNoteId === note.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-400/10'}
               `}
                        >
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-bold text-sm truncate">{note.name.replace('.txt', '')}</span>
                                <span className="text-xs opacity-70 truncate">{note.content?.slice(0, 20) || 'No additional text'}</span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                                className={`opacity-0 group-hover:opacity-100 p-1 rounded ${activeNoteId === note.id ? 'hover:bg-blue-600' : 'hover:bg-gray-300'}`}
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor */}
            <div className={`flex-1 flex flex-col ${theme.isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
                {activeNote ? (
                    <>
                        <div className="p-4 border-b border-inherit flex items-center justify-between">
                            <input
                                value={activeNote.name.replace('.txt', '')}
                                onChange={() => {
                                    // Controlled input handled by default value for now, 
                                    // but to make it editable we should probably track local state or just use onBlur.
                                    // Let's stick to onBlur for the actual rename to avoid syncing issues while typing.
                                }}
                                className="bg-transparent font-bold outline-none text-sm w-full"
                                placeholder="Untitled"
                                onBlur={(e) => {
                                    const newName = e.target.value.trim();
                                    if (newName && newName !== activeNote.name.replace('.txt', '')) {
                                        renameNode(activeNote.id, newName + '.txt');
                                    }
                                }}
                                defaultValue={activeNote.name.replace('.txt', '')}
                                key={activeNote.id} // Re-render input when changing note
                            />
                            <span className="text-xs opacity-50 whitespace-nowrap ml-2">{new Date().toLocaleString()}</span>
                        </div>
                        <textarea
                            value={activeNote.content || ''}
                            onChange={(e) => updateFileContent(activeNote.id, e.target.value)}
                            className="flex-1 w-full p-6 bg-transparent border-none outline-none resize-none font-mono text-base leading-relaxed"
                            placeholder="Start typing..."
                            autoFocus
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-30 select-none" onMouseDown={onWindowDrag}>
                        <FileText size={48} className="mb-2" />
                        <span>Select or create a note</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notes;