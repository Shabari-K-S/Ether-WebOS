import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Battery, Search, Command, Lock, Power, RotateCcw, Info, Moon, Sun, Volume2, Monitor } from 'lucide-react';
import { useOSStore } from '../../store/osStore';
import { APP_METADATA } from '../../apps.config';

const MenuBar: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const { theme, windows, activeWindowId, setLocked, toggleDarkMode, setBrightness, setVolume, launchApp, setIsRestarting, setIsShuttingDown } = useOSStore();

  const [isAppleMenuOpen, setIsAppleMenuOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);

  const appleMenuRef = useRef<HTMLDivElement>(null);
  const controlCenterRef = useRef<HTMLDivElement>(null);

  // Dynamic App Name
  const activeWindow = windows.find(w => w.id === activeWindowId);
  const activeAppName = activeWindow ? APP_METADATA[activeWindow.appId]?.name : 'Ether OS';

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (appleMenuRef.current && !appleMenuRef.current.contains(event.target as Node)) {
        setIsAppleMenuOpen(false);
      }
      if (controlCenterRef.current && !controlCenterRef.current.contains(event.target as Node)) {
        setIsControlCenterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  return (
    <div className={`
      h-8 w-full fixed top-0 left-0 z-50 flex items-center justify-between px-4
      ${theme.isDarkMode ? 'bg-black/40 text-white' : 'bg-white/40 text-black'}
      backdrop-blur-xl border-b border-white/10 select-none text-sm font-medium transition-colors duration-300
    `}>
      <div className="flex items-center space-x-4">
        {/* Apple Menu */}
        <div className="relative" ref={appleMenuRef}>
          <div
            className={`flex items-center font-bold text-lg cursor-pointer hover:opacity-70 ${isAppleMenuOpen ? 'opacity-70' : ''}`}
            onClick={() => setIsAppleMenuOpen(!isAppleMenuOpen)}
          >
            <Command size={16} />
          </div>

          {isAppleMenuOpen && (
            <div className={`
                    absolute top-8 left-0 w-56 rounded-xl shadow-2xl border p-1.5 flex flex-col gap-0.5
                    ${theme.isDarkMode ? 'bg-black/80 border-white/10 text-white' : 'bg-white/80 border-black/10 text-black'}
                    backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 origin-top-left
                `}>
              <button
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white text-left text-sm transition-colors"
                onClick={() => {
                  launchApp('about');
                  setIsAppleMenuOpen(false);
                }}
              >
                <Info size={14} />
                <span>About This Ether</span>
              </button>
              <div className={`h-px my-1 mx-2 ${theme.isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
              <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white text-left text-sm transition-colors" onClick={() => { setIsRestarting(true); setIsAppleMenuOpen(false); }}>
                <RotateCcw size={14} />
                <span>Restart...</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white text-left text-sm transition-colors" onClick={() => setLocked(true)}>
                <Lock size={14} />
                <span>Lock Screen</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white text-left text-sm transition-colors" onClick={() => { setIsShuttingDown(true); setIsAppleMenuOpen(false); }}>
                <Power size={14} />
                <span>Shut Down...</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic App Name */}
        <span className="font-bold hidden sm:inline">{activeAppName}</span>

      </div>

      <div className="flex items-center space-x-4">
        {/* Control Center Trigger */}
        <div className="relative" ref={controlCenterRef}>
          <div
            className="flex items-center space-x-4 cursor-pointer"
            onClick={() => setIsControlCenterOpen(!isControlCenterOpen)}
          >
            <Battery size={18} className="opacity-80 hover:opacity-100" />
            <Wifi size={18} className="opacity-80 hover:opacity-100" />
            <Search size={16} className="opacity-80 hover:opacity-100" />
          </div>

          {/* Control Center Dropdown */}
          {isControlCenterOpen && (
            <div className={`
                    absolute top-8 right-0 w-80 rounded-2xl shadow-2xl border p-4 flex flex-col gap-4
                    ${theme.isDarkMode ? 'bg-black/80 border-white/10 text-white' : 'bg-white/80 border-black/10 text-black'}
                    backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 origin-top-right
                `}>
              <div className="text-xs font-semibold opacity-50 uppercase ml-1">Control Center</div>

              <div className="flex gap-4">
                {/* Toggle Block 1: Wifi */}
                <div className={`flex-1 aspect-square rounded-2xl p-3 flex flex-col justify-between ${theme.isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                  <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-white">
                    <Wifi size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Wi-Fi</div>
                    <div className="text-xs opacity-70">Home Network</div>
                  </div>
                </div>
                {/* Toggle Block 2: Dark Mode */}
                <button
                  className={`flex-1 aspect-square rounded-2xl p-3 flex flex-col justify-between transition-colors ${theme.isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-black/5 hover:bg-black/10'}`}
                  onClick={toggleDarkMode}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${theme.isDarkMode ? 'bg-blue-500' : 'bg-gray-400'}`}>
                    {theme.isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">Dark Mode</div>
                    <div className="text-xs opacity-70">{theme.isDarkMode ? 'On' : 'Off'}</div>
                  </div>
                </button>
              </div>

              {/* Sliders */}
              <div className={`rounded-xl p-3 flex flex-col gap-3 ${theme.isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                <div className="flex items-center gap-3">
                  <Monitor size={16} className="opacity-70" />
                  <input
                    type="range"
                    min="10" max="100"
                    value={theme.brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 size={16} className="opacity-70" />
                  <input
                    type="range"
                    min="0" max="100"
                    value={theme.volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              </div>

            </div>
          )}
        </div>

        <span className="opacity-90 font-medium">{formatDate(date)}</span>
      </div>
    </div>
  );
};

export default MenuBar;