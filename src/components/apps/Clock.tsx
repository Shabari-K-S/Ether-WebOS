import React, { useState, useEffect, useRef } from 'react';
import { useOSStore } from '../../store/osStore';
import { Timer, Hourglass, Globe, Play, Pause, RotateCcw, Plus } from 'lucide-react';

type Tab = 'world' | 'stopwatch' | 'timer';

interface CityTime {
    city: string;
    timezone: string;
}

const ClockApp: React.FC = () => {
    const { theme } = useOSStore();
    const [activeTab, setActiveTab] = useState<Tab>('world');

    // World Clock State
    const [now, setNow] = useState(new Date());
    const [cities] = useState<CityTime[]>([
        { city: 'Local', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        { city: 'New York', timezone: 'America/New_York' },
        { city: 'London', timezone: 'Europe/London' },
        { city: 'Tokyo', timezone: 'Asia/Tokyo' },
    ]);

    // Stopwatch State
    const [swTime, setSwTime] = useState(0);
    const [swRunning, setSwRunning] = useState(false);
    const [laps, setLaps] = useState<number[]>([]);
    const swRef = useRef<number | null>(null);

    // Timer State
    const [timerDuration, setTimerDuration] = useState(5 * 60); // 5 minutes default
    const [timerRemaining, setTimerRemaining] = useState(5 * 60);
    const [timerRunning, setTimerRunning] = useState(false);
    const timerRef = useRef<number | null>(null);

    // World Clock Effect
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Stopwatch Effect
    useEffect(() => {
        if (swRunning) {
            swRef.current = window.setInterval(() => {
                setSwTime(prev => prev + 10);
            }, 10);
        } else if (swRef.current) {
            clearInterval(swRef.current);
        }
        return () => {
            if (swRef.current) clearInterval(swRef.current);
        };
    }, [swRunning]);

    // Timer Effect
    useEffect(() => {
        if (timerRunning && timerRemaining > 0) {
            timerRef.current = window.setInterval(() => {
                setTimerRemaining(prev => {
                    if (prev <= 1) {
                        setTimerRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timerRunning, timerRemaining]);

    const formatTime = (date: Date, timezone: string) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
            timeZone: timezone,
        }).format(date);
    };

    const formatStopwatch = (ms: number) => {
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        const cs = Math.floor((ms % 1000) / 10);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
    };

    const formatTimer = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`flex flex-col h-full ${theme.isDarkMode ? 'text-white' : 'text-black'}`}>

            {/* Tab Navigation */}
            <div className="flex border-b border-white/10">
                <button
                    onClick={() => setActiveTab('world')}
                    className={`flex-1 p-3 flex flex-col items-center justify-center transition-colors ${activeTab === 'world' ? 'bg-white/10 text-blue-400' : 'hover:bg-white/5 opacity-60'}`}
                >
                    <Globe size={20} className="mb-1" />
                    <span className="text-xs font-medium">World Clock</span>
                </button>
                <button
                    onClick={() => setActiveTab('stopwatch')}
                    className={`flex-1 p-3 flex flex-col items-center justify-center transition-colors ${activeTab === 'stopwatch' ? 'bg-white/10 text-orange-400' : 'hover:bg-white/5 opacity-60'}`}
                >
                    <Timer size={20} className="mb-1" />
                    <span className="text-xs font-medium">Stopwatch</span>
                </button>
                <button
                    onClick={() => setActiveTab('timer')}
                    className={`flex-1 p-3 flex flex-col items-center justify-center transition-colors ${activeTab === 'timer' ? 'bg-white/10 text-green-400' : 'hover:bg-white/5 opacity-60'}`}
                >
                    <Hourglass size={20} className="mb-1" />
                    <span className="text-xs font-medium">Timer</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">

                {/* World Clock Tab */}
                {activeTab === 'world' && (
                    <div className="space-y-4">
                        {cities.map((city, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                <div>
                                    <div className="text-sm opacity-60 mb-1">{city.timezone.split('/')[0]}</div>
                                    <div className="text-xl font-bold">{city.city}</div>
                                </div>
                                <div className="text-2xl font-light tracking-widest font-mono">
                                    {formatTime(now, city.timezone)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stopwatch Tab */}
                {activeTab === 'stopwatch' && (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-7xl font-mono font-thin tracking-wider tabular-nums">
                                {formatStopwatch(swTime)}
                            </div>
                        </div>
                        <div className="flex justify-center space-x-6 mb-8">
                            <button
                                onClick={() => {
                                    setSwRunning(false);
                                    setSwTime(0);
                                    setLaps([]);
                                }}
                                className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <RotateCcw size={24} />
                            </button>
                            <button
                                onClick={() => setSwRunning(!swRunning)}
                                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${swRunning ? 'bg-red-500/20 text-red-500 border-2 border-red-500/50' : 'bg-green-500/20 text-green-500 border-2 border-green-500/50'}`}
                            >
                                {swRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                            </button>
                            <button
                                onClick={() => swRunning && setLaps([swTime, ...laps])}
                                disabled={!swRunning}
                                className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <Plus size={24} />
                            </button>
                        </div>
                        {/* Laps */}
                        <div className="h-48 overflow-y-auto border-t border-white/10">
                            {laps.map((lap, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 border-b border-white/5 text-sm font-mono">
                                    <span className="opacity-50">Lap {laps.length - idx}</span>
                                    <span>{formatStopwatch(lap)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Timer Tab */}
                {activeTab === 'timer' && (
                    <div className="flex flex-col h-full items-center justify-center space-y-10">
                        <div className="relative">
                            <svg className="w-56 h-56 transform -rotate-90">
                                <circle
                                    cx="112" cy="112" r="100"
                                    stroke="currentColor" strokeWidth="4"
                                    fill="transparent"
                                    className="text-white/5"
                                />
                                <circle
                                    cx="112" cy="112" r="100"
                                    stroke="currentColor" strokeWidth="4"
                                    fill="transparent"
                                    className="text-green-500 transition-all duration-1000 ease-linear"
                                    strokeDasharray={2 * Math.PI * 100}
                                    strokeDashoffset={2 * Math.PI * 100 * (1 - timerRemaining / timerDuration)}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-5xl font-mono font-thin tabular-nums">
                                    {formatTimer(timerRemaining)}
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => {
                                    setTimerRunning(false);
                                    setTimerRemaining(timerDuration);
                                }}
                                className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <RotateCcw size={24} />
                            </button>
                            <button
                                onClick={() => setTimerRunning(!timerRunning)}
                                className={`p-6 rounded-full transition-all transform hover:scale-105 ${timerRunning ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}
                            >
                                {timerRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                            </button>
                        </div>

                        {/* Presets */}
                        {!timerRunning && (
                            <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                                {[1, 5, 15, 30, 45, 60].map(mins => (
                                    <button
                                        key={mins}
                                        onClick={() => {
                                            setTimerDuration(mins * 60);
                                            setTimerRemaining(mins * 60);
                                        }}
                                        className={`py-2 rounded-lg text-xs font-medium border ${timerDuration === mins * 60 ? 'bg-white text-black border-white' : 'border-white/20 hover:bg-white/10'}`}
                                    >
                                        {mins} min
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClockApp;
