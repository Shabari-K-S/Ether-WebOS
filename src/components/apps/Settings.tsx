import React, { useState } from 'react';
import { useOSStore } from '../../store/osStore';
import { WALLPAPERS } from '../../wallpapers';
import { Moon, Sun, Monitor, Lock } from 'lucide-react';

const SettingsApp: React.FC = () => {
  const { theme, toggleDarkMode, setWallpaper } = useOSStore();
  const [activeTab, setActiveTab] = useState('appearance');

  return (
    <div className="flex h-full text-sm">
      {/* Sidebar */}
      <div className={`
        w-40 flex flex-col p-2 space-y-1 border-r
        ${theme.isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}
      `}>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center space-x-2 p-2 rounded text-left ${activeTab === 'appearance' ? 'bg-blue-500 text-white' : 'hover:bg-white/10'}`}
        >
          <Monitor size={16} />
          <span>Appearance</span>
        </button>
        <button
           onClick={() => setActiveTab('privacy')}
           className={`flex items-center space-x-2 p-2 rounded text-left ${activeTab === 'privacy' ? 'bg-blue-500 text-white' : 'hover:bg-white/10'}`}
        >
          <Lock size={16} />
          <span>Privacy & AI</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <section>
              <h3 className="font-semibold mb-3 text-lg">Theme</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className={`
                    flex flex-col items-center justify-center w-24 h-20 rounded-lg border-2 transition-all
                    ${!theme.isDarkMode ? 'border-blue-500 bg-gray-100' : 'border-transparent bg-white/5'}
                  `}
                >
                  <Sun size={24} className="mb-2" />
                  <span>Light</span>
                </button>
                <button
                  onClick={toggleDarkMode}
                  className={`
                    flex flex-col items-center justify-center w-24 h-20 rounded-lg border-2 transition-all
                    ${theme.isDarkMode ? 'border-blue-500 bg-gray-800' : 'border-transparent bg-black/5'}
                  `}
                >
                  <Moon size={24} className="mb-2" />
                  <span>Dark</span>
                </button>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-3 text-lg">Wallpaper</h3>
              <div className="grid grid-cols-2 gap-4">
                {WALLPAPERS.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setWallpaper(url)}
                    className={`
                      relative aspect-video rounded-lg overflow-hidden border-2 transition-all
                      ${theme.wallpaper === url ? 'border-blue-500' : 'border-transparent hover:border-white/20'}
                    `}
                  >
                    <img src={url} alt="Wallpaper" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <section>
              <h3 className="font-semibold mb-3 text-lg">Gemini API</h3>
              <p className="opacity-70 mb-4 text-xs">
                The Genius app is powered by the Google Gemini API.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsApp;