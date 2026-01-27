import React, { useState } from 'react';
import { useOSStore } from '../../store/osStore';
import { WALLPAPERS } from '../../wallpapers';
import { Moon, Sun, Monitor, Wifi, Volume2, Info, Settings as SettingsIcon } from 'lucide-react';

const SettingsApp: React.FC = () => {
  const { theme, toggleDarkMode, setWallpaper, setBrightness, setVolume } = useOSStore();
  const [activeTab, setActiveTab] = useState('general');

  console.log('Current active tab:', activeTab);

  const handleTabChange = (tabId: string) => {
    console.log('Changing tab to:', tabId);
    setActiveTab(tabId);
  };

  return (
    <div className={`flex h-full text-sm ${theme.isDarkMode ? 'text-white' : 'text-black'}`}>
      {/* Sidebar */}
      <div className={`
        w-48 flex flex-col p-4 space-y-4 border-r overflow-y-auto flex-shrink-0
        ${theme.isDarkMode ? 'bg-[#2a2a2a]/50 border-white/10' : 'bg-[#f5f5f5]/50 border-black/10'}
      `}>
        {/* User Profile */}
        <div className="flex items-center space-x-3 mb-2 px-2">
          <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-lg font-bold">
            U
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Shabari</span>
            <span className="text-xs opacity-60">Local Account</span>
          </div>
        </div>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => handleTabChange('general')}
            className={`
              flex items-center space-x-2 px-2 py-1.5 rounded w-full text-left text-sm font-medium transition-colors
              ${activeTab === 'general'
                ? 'bg-blue-500 text-white'
                : (theme.isDarkMode ? 'hover:bg-white/10 text-white/90' : 'hover:bg-black/5 text-black/90')}
            `}
          >
            <div className="p-1 rounded bg-gray-500 text-white">
              <SettingsIcon size={14} />
            </div>
            <span>General</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('appearance')}
            className={`
              flex items-center space-x-2 px-2 py-1.5 rounded w-full text-left text-sm font-medium transition-colors
              ${activeTab === 'appearance'
                ? 'bg-blue-500 text-white'
                : (theme.isDarkMode ? 'hover:bg-white/10 text-white/90' : 'hover:bg-black/5 text-black/90')}
            `}
          >
            <div className="p-1 rounded bg-blue-500 text-white">
              <Monitor size={14} />
            </div>
            <span>Appearance</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('display')}
            className={`
              flex items-center space-x-2 px-2 py-1.5 rounded w-full text-left text-sm font-medium transition-colors
              ${activeTab === 'display'
                ? 'bg-blue-500 text-white'
                : (theme.isDarkMode ? 'hover:bg-white/10 text-white/90' : 'hover:bg-black/5 text-black/90')}
            `}
          >
            <div className="p-1 rounded bg-cyan-500 text-white">
              <Info size={14} />
            </div>
            <span>Display</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('sound')}
            className={`
              flex items-center space-x-2 px-2 py-1.5 rounded w-full text-left text-sm font-medium transition-colors
              ${activeTab === 'sound'
                ? 'bg-blue-500 text-white'
                : (theme.isDarkMode ? 'hover:bg-white/10 text-white/90' : 'hover:bg-black/5 text-black/90')}
            `}
          >
            <div className="p-1 rounded bg-pink-500 text-white">
              <Volume2 size={14} />
            </div>
            <span>Sound</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('network')}
            className={`
              flex items-center space-x-2 px-2 py-1.5 rounded w-full text-left text-sm font-medium transition-colors
              ${activeTab === 'network'
                ? 'bg-blue-500 text-white'
                : (theme.isDarkMode ? 'hover:bg-white/10 text-white/90' : 'hover:bg-black/5 text-black/90')}
            `}
          >
            <div className="p-1 rounded bg-green-500 text-white">
              <Wifi size={14} />
            </div>
            <span>Network</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-auto">
        <h2 className="text-2xl font-bold mb-6 capitalize">{activeTab.replace('-', ' ')}</h2>

        {activeTab === 'general' && (
          <div className="space-y-6 max-w-lg">
            <div className={`p-4 rounded-xl border ${theme.isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'}`}>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">OS</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Ether OS</h3>
                  <p className="opacity-60">Version 1.0 (Web Build)</p>
                  <p className="opacity-60 text-xs mt-1">MacBook Pro (14-inch, 2024)</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-dashed border-gray-500/30 flex justify-between text-xs opacity-70">
                <span>Processor</span>
                <span>Apple M3 Pro</span>
              </div>
              <div className="mt-2 flex justify-between text-xs opacity-70">
                <span>Memory</span>
                <span>18 GB</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold opacity-60 uppercase ml-1">Device Name</label>
              <input
                type="text"
                defaultValue="Ether's MacBook Pro"
                className={`
                    w-full p-2 rounded-lg border outline-none
                    ${theme.isDarkMode ? 'bg-white/5 border-white/10 focus:border-blue-500' : 'bg-white border-black/10 focus:border-blue-500'}
                  `}
              />
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-8">
            <section>
              <h3 className="font-semibold mb-3">Theme</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={!theme.isDarkMode ? undefined : toggleDarkMode}
                  className={`
                    flex flex-col items-center space-y-2 cursor-pointer
                    ${!theme.isDarkMode ? 'opacity-100' : 'opacity-50 hover:opacity-100'}
                  `}
                >
                  <div className={`w-32 h-20 rounded-lg border-2 bg-[#f0f0f0] flex items-center justify-center ${!theme.isDarkMode ? 'border-blue-500' : 'border-transparent'}`}>
                    <Sun className="text-gray-900" />
                  </div>
                  <span className="text-xs">Light</span>
                </button>
                <button
                  onClick={theme.isDarkMode ? undefined : toggleDarkMode}
                  className={`
                    flex flex-col items-center space-y-2 cursor-pointer
                    ${theme.isDarkMode ? 'opacity-100' : 'opacity-50 hover:opacity-100'}
                  `}
                >
                  <div className={`w-32 h-20 rounded-lg border-2 bg-[#1a1a1a] flex items-center justify-center ${theme.isDarkMode ? 'border-blue-500' : 'border-transparent'}`}>
                    <Moon className="text-white" />
                  </div>
                  <span className="text-xs">Dark</span>
                </button>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-3">Wallpaper</h3>
              <div className="grid grid-cols-3 gap-4">
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

        {activeTab === 'display' && (
          <div className="space-y-6 max-w-lg">
            <div className={`p-4 rounded-xl border space-y-4 ${theme.isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'}`}>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium">Brightness</label>
                  <span className="opacity-60">{theme.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={theme.brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-500/20">
                <div className="flex flex-col">
                  <span className="font-medium">True Tone</span>
                  <span className="text-xs opacity-60">Automatically adapt display to ambient lighting conditions</span>
                </div>
                <div className="w-10 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sound' && (
          <div className="space-y-6 max-w-lg">
            <div className={`p-4 rounded-xl border space-y-4 ${theme.isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'}`}>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium">Output Volume</label>
                  <span className="opacity-60">{theme.volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={theme.volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            <div className={`rounded-xl border overflow-hidden ${theme.isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'}`}>
              <div className={`px-4 py-2 border-b text-xs font-semibold opacity-60 uppercase ${theme.isDarkMode ? 'border-white/10' : 'border-black/10'}`}>Output Device</div>
              <div className="p-1">
                <div className={`flex items-center justify-between px-3 py-2 rounded ${theme.isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <span className="text-sm">MacBook Pro Speakers</span>
                  <span className="text-xs font-bold text-blue-500">Built-in</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="space-y-6 max-w-lg">
            <div className={`p-4 rounded-xl border flex items-center justify-between ${theme.isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <Wifi size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">Wi-Fi</span>
                  <span className="text-xs text-green-500 font-medium">Connected to EtherNet</span>
                </div>
              </div>
              <div className="w-10 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsApp;