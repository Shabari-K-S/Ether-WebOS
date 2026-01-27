import React, { useState, useRef } from 'react';
import { useOSStore } from '../../store/osStore';
import {
    ArrowRight,
    RotateCcw,
    Home,
    Lock,
    Globe,
    ChevronLeft,
    ChevronRight,
    Search,
    X,
    MoreHorizontal,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import type { AppProps } from '../../types';



const BOOKMARKS = [
    { name: 'Portfolio', url: 'https://shabari-k-s.vercel.app', icon: '👨‍💻' },
    { name: 'Code Flow', url: 'https://codeflow-app.vercel.app', icon: '🌊' },
    { name: 'ReactUI Library', url: 'https://rui-lib.vercel.app', icon: '⚛️' },
];

interface OrganicResult {
    position: number;
    title: string;
    link: string;
    snippet: string;
    favicon?: string;
}

const BrowserApp: React.FC<AppProps> = ({ onWindowDrag }) => {
    const { theme } = useOSStore();
    const [url, setUrl] = useState('');
    const [currentSrc, setCurrentSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'home' | 'search' | 'browser'>('home');
    const [searchResults, setSearchResults] = useState<OrganicResult[]>([]);
    const [searchError, setSearchError] = useState<string | null>(null);

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
        setIsLoading(true);
        let finalUrl = targetUrl;
        if (!finalUrl.match(/^https?:\/\//)) {
            finalUrl = 'https://' + finalUrl;
        }
        setCurrentSrc(finalUrl);
        setUrl(finalUrl);
        setViewMode('browser');

        // Simulate load delay for better UX feel
        setTimeout(() => setIsLoading(false), 1500);
    };

    const performSearch = async (query: string) => {
        setIsLoading(true);
        setSearchError(null);
        setViewMode('search');
        setUrl(query);

        if (!import.meta.env.VITE_SEARCH_API_KEY) {
            setSearchError('Missing API Key. Please configure VITE_SEARCH_API_KEY in .env');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&api_key=${import.meta.env.VITE_SEARCH_API_KEY}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.organic_results) {
                setSearchResults(data.organic_results);
            } else {
                setSearchResults([]);
            }
        } catch (err: any) {
            console.error("Search failed:", err);
            setSearchError(err.message || 'Failed to fetch search results.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNavigate = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const input = url.trim();
        if (!input) return;

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
        } else {
            // If strictly at start, maybe go home?
            goHome();
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
        if (viewMode === 'browser') {
            setIsLoading(true);
            if (currentSrc && iframeRef.current) {
                iframeRef.current.src = currentSrc;
            }
            setTimeout(() => setIsLoading(false), 500);
        } else if (viewMode === 'search') {
            performSearch(url);
        }
    };

    const goHome = () => {
        setCurrentSrc(null);
        setUrl('');
        setViewMode('home');
        setSearchResults([]);
        setSearchError(null);
    };

    return (
        <div className={`flex flex-col h-full w-full overflow-hidden transition-colors duration-300 ${theme.isDarkMode ? 'bg-[#1e1e1e]' : 'bg-[#f0f2f5]'}`}>

            {/* Minimalist Toolbar */}
            <div
                onMouseDown={onWindowDrag}
                className={`
                    w-full px-4 py-3 flex items-center gap-3 select-none flex-shrink-0 z-20
                    ${theme.isDarkMode ? 'bg-[#1e1e1e] border-b border-white/5' : 'bg-[#f0f2f5] border-b border-black/5'}
                `}
            >
                {/* Traffic Lights Spacer */}
                <div className="w-16 flex-shrink-0" />

                {/* Navigation Controls */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={goBack}
                        className={`p-2 rounded-full transition-all ${theme.isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-gray-600'}`}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={goForward}
                        className={`p-2 rounded-full transition-all ${theme.isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-gray-600'}`}
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button
                        onClick={refresh}
                        className={`p-2 rounded-full transition-all ${theme.isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-gray-600'}`}
                    >
                        {isLoading ? <X size={16} /> : <RotateCcw size={16} />}
                    </button>
                </div>

                {/* Address Bar */}
                <form
                    onSubmit={handleNavigate}
                    className={`
                        flex-1 max-w-2xl mx-auto h-10 px-3 rounded-xl flex items-center gap-2 transition-all duration-300
                        ${theme.isDarkMode
                            ? 'bg-[#2d2d2d] hover:bg-[#333] focus-within:bg-[#2d2d2d] focus-within:ring-2 focus-within:ring-blue-500/20 text-gray-200'
                            : 'bg-white hover:bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 text-gray-700 shadow-sm'}
                    `}
                >
                    <div className="flex-shrink-0">
                        {viewMode === 'browser' ? <Lock size={14} className="text-green-500" /> : <Search size={14} className="text-gray-400" />}
                    </div>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onFocus={(e) => e.target.select()}
                        placeholder="Search or type a URL"
                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder-gray-400/80"
                    />
                </form>

                {/* Right Actions */}
                <div className="flex items-center gap-2 w-[100px] justify-end">
                    <button
                        onClick={goHome}
                        className={`p-2 rounded-full transition-all ${theme.isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-gray-600'}`}
                    >
                        <Home size={18} />
                    </button>
                    <button
                        className={`p-2 rounded-full transition-all ${theme.isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-gray-600'}`}
                    >
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative w-full h-full overflow-hidden flex flex-col">
                {isLoading && (
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/20 overflow-hidden z-30">
                        <div className="h-full bg-blue-500 w-1/3 animate-[loading_1s_ease-in-out_infinite]" />
                    </div>
                )}

                {viewMode === 'home' && (
                    // Home Screen
                    <div className="flex-1 overflow-y-auto w-full flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
                        <div className="mb-12 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                                <Globe size={40} className="text-white" />
                            </div>
                            <h1 className={`text-3xl font-semibold mb-2 ${theme.isDarkMode ? 'text-white' : 'text-gray-800'}`}>Ether Browser</h1>
                        </div>

                        {/* Search Input (Big) */}
                        <div className={`
                            w-full max-w-xl p-1.5 rounded-2xl mb-12 shadow-2xl transition-all duration-300
                            ${theme.isDarkMode ? 'bg-[#2d2d2d] shadow-black/40' : 'bg-white shadow-black/5'}
                        `}>
                            <form onSubmit={handleNavigate} className="w-full flex items-center">
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="Search the web..."
                                    className={`
                                        w-full h-12 px-4 bg-transparent outline-none text-lg
                                        ${theme.isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}
                                    `}
                                    autoFocus
                                />
                                <button type="submit" className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors">
                                    <ArrowRight size={20} />
                                </button>
                            </form>
                        </div>

                        {/* Speed Dial / Bookmarks */}
                        <div className="flex flex-wrap justify-center gap-6 max-w-3xl">
                            {BOOKMARKS.map((item) => (
                                <button
                                    key={item.url}
                                    onClick={() => { loadUrl(item.url); addToHistory(item.url); }}
                                    className={`
                                        group flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-200 outline-none
                                        ${theme.isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'}
                                    `}
                                >
                                    <div className={`
                                        w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-transform group-hover:scale-105
                                        ${theme.isDarkMode ? 'bg-[#2d2d2d] text-white shadow-black/20' : 'bg-white text-gray-800 shadow-gray-200'}
                                    `}>
                                        {item.icon}
                                    </div>
                                    <span className={`text-sm font-medium ${theme.isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-black'}`}>
                                        {item.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {viewMode === 'search' && (
                    // Search Results View
                    <div className={`flex-1 overflow-y-auto p-4 md:p-8 ${theme.isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        <div className="max-w-3xl mx-auto">
                            {searchError && (
                                <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex items-center gap-3 text-red-500">
                                    <AlertCircle size={20} />
                                    <p>{searchError}</p>
                                </div>
                            )}

                            {!isLoading && searchResults.length === 0 && !searchError && (
                                <div className="text-center py-20 opacity-50">
                                    <p>No results found.</p>
                                </div>
                            )}

                            <div className="space-y-6">
                                {searchResults.map((result) => (
                                    <div key={result.position} className="group">
                                        <div className="flex items-center gap-2 mb-1 text-sm opacity-60">
                                            {result.favicon && <img src={result.favicon} alt="" className="w-4 h-4 rounded-sm" />}
                                            <span className="truncate">{result.link}</span>
                                        </div>
                                        <button
                                            onClick={() => { loadUrl(result.link); addToHistory(result.link); }}
                                            className="text-xl text-blue-500 hover:underline font-medium block text-left mb-1"
                                        >
                                            {result.title}
                                        </button>
                                        <p className={`text-sm leading-relaxed ${theme.isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {result.snippet}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'browser' && currentSrc && (
                    // Iframe View
                    <div className="w-full h-full relative bg-white flex-1">
                        <iframe
                            ref={iframeRef}
                            src={currentSrc}
                            className="w-full h-full border-none"
                            title="Browser Content"
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-presentation"
                        />
                        <div className={`
                            absolute bottom-0 w-full px-4 py-2 text-center text-xs backdrop-blur-md border-t
                            ${theme.isDarkMode ? 'bg-black/80 text-gray-400 border-white/5' : 'bg-white/90 text-gray-500 border-black/5'}
                        `}>
                            <div className="flex items-center justify-center gap-2">
                                <Lock size={10} />
                                <span>SSL Secured</span>
                                <span className="mx-2 opacity-50">|</span>
                                <span>Note: Many major websites block iframe embedding.</span>
                                <a href={currentSrc} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">
                                    Open in new tab <ExternalLink size={10} />
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowserApp;