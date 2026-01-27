import React, { useState, useEffect } from 'react';
import { useOSStore } from '../../store/osStore';
import { APPS } from '../../constants';
import { Search } from 'lucide-react';

const AppLauncher: React.FC = () => {
    const { isLauncherOpen, launchApp, setLauncherOpen, theme } = useOSStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    // Handle animation timing
    useEffect(() => {
        if (isLauncherOpen) {
            setIsVisible(true);
            setSearchTerm(''); // Reset search when opening
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Wait for fade out
            return () => clearTimeout(timer);
        }
    }, [isLauncherOpen]);

    // Handle Escape key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isLauncherOpen) {
                setLauncherOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLauncherOpen, setLauncherOpen]);

    if (!isVisible) return null;

    const filteredApps = Object.values(APPS).filter(app =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div
            className={`
        fixed inset-0 z-[60] flex flex-col items-center justify-start pt-24
        transition-all duration-300 ease-in-out
        ${isLauncherOpen ? 'opacity-100 scale-100 backdrop-blur-2xl bg-black/40' : 'opacity-0 scale-110 pointer-events-none'}
      `}
            onClick={() => setLauncherOpen(false)} // Click background to close
        >
            {/* Search Bar */}
            <div
                className="w-full max-w-md mb-16 relative transform transition-transform duration-500"
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
                        autoFocus
                    />
                </div>
            </div>

            {/* App Grid */}
            <div
                className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-8 md:gap-12 max-w-5xl px-8"
                onClick={e => e.stopPropagation()}
            >
                {Object.values(APPS).map((app) => (
                    <button
                        key={app.id}
                        onClick={() => launchApp(app.id)}
                        className="group flex flex-col items-center gap-4 transition-all duration-200 hover:scale-110"
                    >
                        <div className={`
              w-20 h-20 md:w-24 md:h-24 rounded-[22px] flex items-center justify-center shadow-2xl transition-all duration-200
              ${typeof app.icon === 'string'
                                ? 'bg-transparent'
                                : `bg-gradient-to-br from-gray-700 to-black text-white
                     ${app.id === 'finder' ? 'from-blue-400 to-blue-600' : ''}
                     ${app.id === 'settings' ? 'from-gray-300 to-gray-500' : ''}
                     ${app.id === 'terminal' ? 'from-gray-800 to-black' : ''}
                     ${app.id === 'pixelpaint' ? 'from-gray-800 to-black' : ''}`
                            }
              group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]
              transition-shadow
            `}>
                            {typeof app.icon === 'string' ? (
                                <img src={app.icon} alt={app.name} className="w-full h-full object-contain drop-shadow-md" />
                            ) : (
                                <app.icon size={48} />
                            )}
                        </div>
                        <span className={`text-sm font-medium tracking-wide shadow-black drop-shadow-md ${theme.isDarkMode ? 'text-white' : 'text-white'}`}>
                            {app.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Empty State */}
            {filteredApps.length === 0 && (
                <div className="text-white/50 text-xl font-light mt-10">No applications found</div>
            )}
        </div>
    );
};

export default AppLauncher;