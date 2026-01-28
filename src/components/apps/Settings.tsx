import React, { useState } from 'react';
import { useOSStore } from '../../store/osStore';
import { WALLPAPERS } from '../../wallpapers';
import { Moon, Sun, Monitor, Wifi, Volume2, Info, Settings as SettingsIcon } from 'lucide-react';

const Toggle: React.FC<{ active: boolean; onChange: () => void }> = ({ active, onChange }) => (
  <button
    onClick={onChange}
    className={`w-10 h-6 rounded-full relative transition-colors duration-200 ease-in-out ${active ? 'bg-blue-500' : 'bg-gray-400'}`}
  >
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${active ? 'translate-x-5' : 'translate-x-1'}`} />
  </button>
);

const SettingCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const { theme } = useOSStore();
  return (
    <div className={`p-4 rounded-xl border ${theme.isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'} ${className}`}>
      {children}
    </div>
  );
};

const SettingsApp: React.FC = () => {
  const { theme, toggleDarkMode, setWallpaper, setBrightness, setVolume } = useOSStore();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', icon: <SettingsIcon size={14} />, label: 'General', color: 'bg-gray-500' },
    { id: 'appearance', icon: <Monitor size={14} />, label: 'Appearance', color: 'bg-blue-500' },
    { id: 'display', icon: <Info size={14} />, label: 'Display', color: 'bg-cyan-500' },
    { id: 'sound', icon: <Volume2 size={14} />, label: 'Sound', color: 'bg-pink-500' },
    { id: 'network', icon: <Wifi size={14} />, label: 'Network', color: 'bg-green-500' },
  ];

  return (
    <div className={`flex h-full text-sm ${theme.isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      {/* Sidebar */}
      <div className={`
        w-52 flex flex-col p-3 border-r flex-shrink-0
        ${theme.isDarkMode ? 'bg-[#2a2a2a]/40 border-white/10' : 'bg-[#f5f5f5]/60 border-black/5'}
        backdrop-blur-md
      `}>
        {/* User Profile */}
        <div className="flex items-center space-x-3 p-3 mb-4 rounded-xl hover:bg-black/5 cursor-pointer transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
            S
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm truncate">Shabari</span>
            <span className="text-[10px] opacity-50 uppercase font-bold tracking-wider">Local Account</span>
          </div>
        </div>

        <nav className="space-y-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg w-full text-left text-sm transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : (theme.isDarkMode ? 'hover:bg-white/10 text-white/80' : 'hover:bg-black/5 text-gray-700')}
              `}
            >
              <div className={`p-1 rounded-md ${activeTab === tab.id ? 'bg-white/20' : tab.color} text-white transition-colors`}>
                {tab.icon}
              </div>
              <span className={`font-medium ${activeTab === tab.id ? 'opacity-100' : 'opacity-90'}`}>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-transparent">
        <div className="max-w-2xl mx-auto p-10 pb-20">
          <h2 className="text-3xl font-extrabold mb-8 tracking-tight capitalize">{activeTab}</h2>

          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SettingCard className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-blue-500/10">
                  <span className="text-white font-black text-2xl tracking-tighter">OS</span>
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight">Ether OS</h3>
                  <p className="opacity-50 font-medium italic">Version 1.1</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[10px] font-bold">Latest Release</span>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-[10px] font-bold">Stable</span>
                  </div>
                </div>
              </SettingCard>

              <div className="grid grid-cols-2 gap-4">
                <SettingCard>
                  <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Processor</div>
                  <div className="font-semibold">Intel Core Ultra X9</div>
                  <div className="text-xs opacity-50 mt-1">24-core CPU</div>
                </SettingCard>
                <SettingCard>
                  <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Memory</div>
                  <div className="font-semibold">64 GB</div>
                  <div className="text-xs opacity-50 mt-1">LPDDR5X</div>
                </SettingCard>
              </div>

              <section className="space-y-3">
                <h4 className="text-xs font-bold opacity-40 uppercase tracking-widest ml-1">Device Identity</h4>
                <SettingCard className="!p-1">
                  <input
                    type="text"
                    defaultValue="EtherBook Pro"
                    className="w-full p-3 bg-transparent outline-none font-medium text-inherit"
                    placeholder="Device Name"
                  />
                </SettingCard>
              </section>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section>
                <h4 className="text-xs font-bold opacity-40 uppercase tracking-widest ml-1 mb-3">Theme Mode</h4>
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => theme.isDarkMode && toggleDarkMode()}
                    className={`group flex flex-col items-center space-y-3 transition-transform active:scale-95`}
                  >
                    <div className={`
                        w-40 h-24 rounded-xl border-2 overflow-hidden bg-[#f0f0f0] relative transition-all duration-300
                        ${!theme.isDarkMode ? 'border-blue-500 shadow-lg ring-4 ring-blue-500/10' : 'border-transparent opacity-60 hover:opacity-100'}
                      `}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sun className={`${!theme.isDarkMode ? 'text-orange-400' : 'text-gray-400'} animate-pulse`} size={32} />
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 h-4 bg-white/50 rounded" />
                    </div>
                    <span className={`text-xs font-extrabold ${!theme.isDarkMode ? 'text-blue-500' : 'opacity-60'}`}>LIGHT</span>
                  </button>

                  <button
                    onClick={() => !theme.isDarkMode && toggleDarkMode()}
                    className={`group flex flex-col items-center space-y-3 transition-transform active:scale-95`}
                  >
                    <div className={`
                        w-40 h-24 rounded-xl border-2 overflow-hidden bg-[#1a1a1a] relative transition-all duration-300
                        ${theme.isDarkMode ? 'border-blue-500 shadow-lg ring-4 ring-blue-500/10' : 'border-transparent opacity-60 hover:opacity-100'}
                      `}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Moon className={`${theme.isDarkMode ? 'text-blue-400' : 'text-gray-600'} animate-pulse`} size={32} />
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 h-4 bg-black/50 rounded" />
                    </div>
                    <span className={`text-xs font-extrabold ${theme.isDarkMode ? 'text-blue-500' : 'opacity-60'}`}>DARK</span>
                  </button>
                </div>
              </section>

              <section>
                <h4 className="text-xs font-bold opacity-40 uppercase tracking-widest ml-1 mb-3">Wallpaper</h4>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {WALLPAPERS.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setWallpaper(url)}
                      className={`
                          relative aspect-video rounded-xl overflow-hidden border-2 transition-all duration-300 active:scale-95
                          ${theme.wallpaper === url ? 'border-blue-500 shadow-lg ring-4 ring-blue-500/10' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-[1.02]'}
                        `}
                    >
                      <img src={url} alt="Wallpaper" className="w-full h-full object-cover" />
                      {theme.wallpaper === url && (
                        <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                          <div className="bg-blue-500 text-white rounded-full p-1 shadow-lg">
                            <Info size={12} strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SettingCard className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <label className="font-bold text-base tracking-tight italic">Brightness</label>
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Screen Intensity</span>
                    </div>
                    <span className="text-lg font-black text-blue-500 tabular-nums">{theme.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={theme.brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div className={`h-px mx-[-1rem] ${theme.isDarkMode ? 'bg-white/10' : 'bg-black/5'}`} />

                <div className="flex items-center justify-between">
                  <div className="flex flex-col pr-8">
                    <span className="font-bold text-base tracking-tight italic">True Tone</span>
                    <span className="text-xs opacity-50 mt-1">Automatically adapt display to ambient lighting for better eye comfort</span>
                  </div>
                  <Toggle active={true} onChange={() => { }} />
                </div>
              </SettingCard>
            </div>
          )}

          {activeTab === 'sound' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SettingCard className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <label className="font-bold text-base tracking-tight italic">System Volume</label>
                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Audio Output Level</span>
                  </div>
                  <span className="text-lg font-black text-blue-500 tabular-nums">{theme.volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={theme.volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
              </SettingCard>

              <SettingCard className="!p-0 overflow-hidden">
                <div className={`px-4 py-3 border-b text-[10px] font-bold opacity-40 uppercase tracking-widest ${theme.isDarkMode ? 'border-white/10 bg-white/5' : 'border-black/5 bg-gray-50'}`}>Output Device</div>
                <div className="p-2">
                  <div className={`flex items-center justify-between p-3 rounded-lg ${theme.isDarkMode ? 'bg-blue-500/20 ring-1 ring-blue-500/30' : 'bg-blue-50 ring-1 ring-blue-100'}`}>
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-500 rounded-full p-2 text-white shadow-md">
                        <Volume2 size={16} />
                      </div>
                      <span className="font-bold">EtherBook Pro Speakers</span>
                    </div>
                    <span className="text-[10px] font-black bg-blue-500 text-white px-2 py-0.5 rounded shadow-sm">DEFAULT</span>
                  </div>
                </div>
              </SettingCard>
            </div>
          )}

          {activeTab === 'network' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SettingCard className="flex items-center justify-between p-5">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-xl rotate-[-2deg]">
                    <Wifi size={28} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-lg tracking-tight">Wi-Fi</span>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm text-green-500 font-bold uppercase tracking-tight">Connected</span>
                      <span className="text-xs opacity-50 px-2 py-0.5 bg-black/5 rounded-full ml-1">EtherNet_5G</span>
                    </div>
                  </div>
                </div>
                <Toggle active={true} onChange={() => { }} />
              </SettingCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsApp;