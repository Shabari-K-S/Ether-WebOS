import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Search, Command } from 'lucide-react';
import { useOSStore } from '../../store/osStore';

const MenuBar: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const { theme } = useOSStore();

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
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
        <div className="flex items-center font-bold text-lg">
          <Command size={16} />
        </div>
        <span className="font-bold hidden sm:inline">Ether OS</span>
        <span className="hidden sm:inline opacity-80 hover:opacity-100 cursor-pointer">File</span>
        <span className="hidden sm:inline opacity-80 hover:opacity-100 cursor-pointer">Edit</span>
        <span className="hidden sm:inline opacity-80 hover:opacity-100 cursor-pointer">View</span>
        <span className="hidden sm:inline opacity-80 hover:opacity-100 cursor-pointer">Go</span>
        <span className="hidden sm:inline opacity-80 hover:opacity-100 cursor-pointer">Window</span>
        <span className="hidden sm:inline opacity-80 hover:opacity-100 cursor-pointer">Help</span>
      </div>

      <div className="flex items-center space-x-4">
        <Battery size={18} className="opacity-80" />
        <Wifi size={18} className="opacity-80" />
        <Search size={16} className="opacity-80" />
        <span className="opacity-90">{formatDate(date)}</span>
      </div>
    </div>
  );
};

export default MenuBar;