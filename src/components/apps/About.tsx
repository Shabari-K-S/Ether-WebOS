import React from 'react';
import { useOSStore } from '../../store/osStore';
import ComputerImage from '../../assets/computer-img.png';

const AboutApp: React.FC = () => {
    const { launchApp, theme } = useOSStore();

    return (
        <div className={`h-full flex flex-col items-center justify-start p-8 ${theme.isDarkMode ? 'text-white' : 'text-gray-800'}`}>
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
                <h2 className="text-3xl font-black tracking-tighter">EtherBook Pro</h2>
                <p className="text-xs opacity-50 font-bold uppercase tracking-widest">13-inch, M3 Ultra X9, 2026</p>
            </div>

            {/* Specifications */}
            <div className="w-full max-w-[240px] space-y-3 mb-10">
                <div className="flex justify-between text-xs">
                    <span className="font-bold opacity-40 uppercase tracking-tight">Chip</span>
                    <span className="font-semibold italic">Intel Core Ultra X9</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="font-bold opacity-40 uppercase tracking-tight">Memory</span>
                    <span className="font-semibold italic">64 GB</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="font-bold opacity-40 uppercase tracking-tight">Ether OS</span>
                    <span className="font-semibold italic">Version 1.1</span>
                </div>
            </div>

            {/* Actions */}
            <button
                onClick={() => launchApp('settings')}
                className={`
                    px-6 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95
                    ${theme.isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}
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
