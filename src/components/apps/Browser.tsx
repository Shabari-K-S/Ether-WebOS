import React, { useState, useRef } from 'react';
import { useOSStore } from '../../store/osStore';
import { ArrowRight, RotateCcw, Home, Lock, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AppProps } from '../../types';

const BOOKMARKS = [
    { name: 'Portfolio', url: 'https://shabari-k-s.vercel.app' },
    { name: 'Code Flow', url: 'https://codeflow-app.vercel.app' },
    { name: 'ReactUI Library', url: 'https://rui-lib.vercel.app' },
];

const BrowserApp: React.FC<AppProps> = ({ onWindowDrag }) => {
    const { theme } = useOSStore();
    const [url, setUrl] = useState('');
    const [currentSrc, setCurrentSrc] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const addToHistory = (val: string) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(val);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const loadUrl = (targetUrl: string) => {
        let finalUrl = targetUrl;
        if (!finalUrl.match(/^https?:\/\//)) {
            finalUrl = 'https://' + finalUrl;
        }
        setCurrentSrc(finalUrl);
        setUrl(finalUrl);
    };

    const performSearch = (query: string) => {
        // Use DuckDuckGo search
        const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
        setCurrentSrc(searchUrl);
        setUrl(query);
    };

    const handleNavigate = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const input = url.trim();
        if (!input) return;

        // Check if it's a URL or search query
        const isUrl = input.includes('.') && !input.includes(' ');

        if (isUrl) {
            loadUrl(input);
            addToHistory(input);
        } else {
            performSearch(input);
            addToHistory(`search:${input}`);
        }
    };

    const goBack = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const entry = history[newIndex];

            if (entry.startsWith('search:')) {
                performSearch(entry.substring(7));
            } else {
                loadUrl(entry);
            }
        }
    };

    const goForward = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            const entry = history[newIndex];

            if (entry.startsWith('search:')) {
                performSearch(entry.substring(7));
            } else {
                loadUrl(entry);
            }
        }
    };

    const refresh = () => {
        if (currentSrc && iframeRef.current) {
            iframeRef.current.src = currentSrc;
        }
    };

    const goHome = () => {
        setCurrentSrc(null);
        setUrl('');
    };

    const renderHome = () => (
        <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl">
                <Globe size={48} className="text-white" />
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${theme.isDarkMode ? 'text-white' : 'text-gray-800'}`}>Ether Browser</h1>
            <p className={`mb-8 max-w-md ${theme.isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Search the web or enter a URL to get started.
            </p>

            <div className="w-full max-w-xl relative group">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
                    placeholder="Search the web or enter URL..."
                    className={`
            w-full px-6 py-4 rounded-full text-lg shadow-lg border outline-none transition-all
            ${theme.isDarkMode
                            ? 'bg-[#2a2a2a] border-white/10 text-white focus:border-blue-500 placeholder-gray-500'
                            : 'bg-white border-gray-200 text-gray-800 focus:border-blue-500 placeholder-gray-400'}
          `}
                    autoFocus
                />
                <button
                    onClick={() => handleNavigate()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
                >
                    <ArrowRight size={20} />
                </button>
            </div>

            {/* Quick Access Bookmarks on Home */}
            <div className="mt-12 flex flex-wrap gap-4 justify-center">
                {BOOKMARKS.map((bookmark) => (
                    <button
                        key={bookmark.url}
                        onClick={() => { loadUrl(bookmark.url); addToHistory(bookmark.url); }}
                        className={`
              px-6 py-3 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg
              ${theme.isDarkMode
                                ? 'bg-[#2a2a2a] border-white/10 text-white hover:border-blue-500/50'
                                : 'bg-white border-gray-200 text-gray-800 hover:border-blue-500/50'}
            `}
                    >
                        {bookmark.name}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className={`flex flex-col h-full ${theme.isDarkMode ? 'bg-[#1a1a1a]' : 'bg-[#f5f5f5]'}`}>
            {/* Unified Toolbar */}
            <div
                onMouseDown={onWindowDrag}
                className={`
          flex flex-col border-b transition-colors duration-200 pt-3 pb-2 select-none
          ${theme.isDarkMode ? 'bg-[#2a2a2a] border-black/20 text-white' : 'bg-[#e5e5e5] border-black/10 text-black'}
        `}
            >
                <div className="flex items-center px-3 space-x-3">
                    {/* Spacer for Traffic Lights (roughly 60px) */}
                    <div className="w-[60px] flex-shrink-0" />

                    {/* Nav Buttons */}
                    <div className="flex space-x-1 flex-shrink-0">
                        <button
                            onClick={goBack}
                            disabled={historyIndex <= 0}
                            className="p-1.5 rounded hover:bg-black/10 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={goForward}
                            disabled={historyIndex >= history.length - 1}
                            className="p-1.5 rounded hover:bg-black/10 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={refresh}
                            className="p-1.5 rounded hover:bg-black/10 transition-colors"
                        >
                            <RotateCcw size={14} />
                        </button>
                    </div>

                    {/* Address Bar */}
                    <form onSubmit={handleNavigate} className="flex-1 max-w-2xl mx-auto w-full">
                        <div className={`
              flex items-center px-3 py-1.5 rounded-lg text-sm transition-all
              ${theme.isDarkMode ? 'bg-[#1a1a1a] text-white shadow-inner border border-white/5' : 'bg-white text-black border border-gray-300 shadow-sm'}
              focus-within:ring-2 ring-blue-500/50
            `}>
                            <div className="mr-2">
                                <Lock size={12} className={currentSrc ? 'text-green-500' : 'opacity-40'} />
                            </div>
                            <input
                                type="text"
                                value={url}
                                onMouseDown={(e) => e.stopPropagation()} // Allow text selection, don't drag window
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => setUrl(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-center"
                                placeholder="Search or enter URL"
                            />
                        </div>
                    </form>

                    {/* Right spacer for symmetry */}
                    <div className="w-[60px] flex justify-end">
                        <button
                            onClick={goHome}
                            className="p-1.5 rounded hover:bg-black/10 transition-colors"
                        >
                            <Home size={16} />
                        </button>
                    </div>
                </div>

                {/* Bookmarks Bar - Only show when not on home screen */}
                {currentSrc && (
                    <div className="flex px-4 pt-2 pb-0.5 space-x-4 overflow-x-auto no-scrollbar justify-center">
                        {BOOKMARKS.map((bookmark) => (
                            <button
                                key={bookmark.url}
                                onClick={() => { loadUrl(bookmark.url); addToHistory(bookmark.url); }}
                                className={`
                  flex items-center space-x-1 px-2 py-0.5 rounded text-xs whitespace-nowrap opacity-70 hover:opacity-100
                  ${theme.isDarkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/5 text-gray-700'}
                  transition-colors
                `}
                            >
                                <span>{bookmark.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Browser Content */}
            <div className={`flex-1 relative overflow-hidden ${theme.isDarkMode ? 'bg-[#111]' : 'bg-white'}`}>
                {!currentSrc ? (
                    renderHome()
                ) : (
                    <div className="w-full h-full relative bg-white">
                        <iframe
                            ref={iframeRef}
                            src={currentSrc}
                            className="w-full h-full border-none"
                            title="Browser Content"
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-presentation"
                        />
                        <div className={`absolute bottom-0 w-full p-2 text-center text-xs backdrop-blur-md border-t ${theme.isDarkMode ? 'bg-black/60 text-white border-white/10' : 'bg-white/80 text-black border-black/10'}`}>
                            If the content is blocked, the website likely forbids embedding. <a href={currentSrc} target="_blank" rel="noreferrer" className="underline font-semibold hover:text-blue-500">Open in new tab</a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowserApp;