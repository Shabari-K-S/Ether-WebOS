import React from 'react';
import { useOSStore } from '../../store/osStore';
import ComputerImage from '../../assets/computer-img.png';

const AboutApp: React.FC = () => {
    const { launchApp, theme } = useOSStore();

    return (
        <div className={`h-full flex flex-col items-center justify-start p-8 ${theme.isDarkMode ? 'text-white' : 'text-gray-900'} bg-transparent`}>
            {/* Device Image */}
            <div className="w-full max-w-[280px] aspect-video relative mb-8 group">
                <img
                    src={ComputerImage}
                    alt="EtherBook Pro"
                    className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                />
            </div>

            {/* Device Info */}
            <div className="text-center space-y-1 mb-8">
                <h2 className="text-3xl font-black tracking-tighter text-inherit">EtherBook Pro</h2>
                <p className="text-[10px] opacity-40 font-bold uppercase tracking-[0.2em]">13-inch, M3 Ultra X9, 2026</p>
            </div>

            {/* Specifications */}
            <div className="w-full max-w-[240px] space-y-4 mb-10">
                <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold opacity-30 uppercase tracking-widest">Chip</span>
                    <span className="font-medium opacity-90">Intel Core Ultra X9</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold opacity-30 uppercase tracking-widest">Memory</span>
                    <span className="font-medium opacity-90">64 GB</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold opacity-30 uppercase tracking-widest">Ether OS</span>
                    <span className="font-medium opacity-90">Version 1.1</span>
                </div>
            </div>

            {/* Actions */}
            <button
                onClick={() => launchApp('settings')}
                className={`
                    px-6 py-1.5 rounded-full text-[10px] font-bold transition-all active:scale-95 shadow-lg
                    ${theme.isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}
                `}
            >
                More Info...
            </button>

            <div className="mt-auto pt-6 text-[10px] opacity-30 font-medium text-center leading-relaxed">
                Regulatory Certification<br />
                ™ and © 2024-2026 Ether Inc.<br />
                All Rights Reserved.
            </div>
        </div>
    );
};

export default AboutApp;
