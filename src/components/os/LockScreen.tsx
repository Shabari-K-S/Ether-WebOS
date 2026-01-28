import React, { useState, useEffect } from 'react';
import { useOSStore } from '../../store/osStore';
import { ArrowRight, Lock } from 'lucide-react';

const LockScreen: React.FC = () => {
    const { setLocked, theme } = useOSStore();
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogin = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Mock authentication - accept any non-empty password or just "admin" / "password"
        // For now, let's make it simple: just press enter or type anything
        if (true) {
            // Add a small delay for effect
            setTimeout(() => setLocked(false), 300);
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[10000] bg-cover bg-center flex flex-col items-center justify-center text-white"
            style={{ backgroundImage: `url(${theme.wallpaper})` }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

            <div className="z-10 flex flex-col items-center space-y-8 animate-in fade-in duration-700">
                <div className="flex flex-col items-center space-y-2 mb-8">
                    <Lock size={48} className="opacity-80 mb-4" />
                    <h1 className="text-8xl font-thin tracking-tight">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </h1>
                    <h2 className="text-2xl font-light opacity-90">
                        {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h2>
                </div>

                <form onSubmit={handleLogin} className="relative group">
                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`
                            bg-white/20 border border-white/30 rounded-full px-12 py-3 w-64 text-center placeholder-white/50 outline-none 
                            focus:bg-white/30 transition-all duration-300 backdrop-blur-xl
                            ${error ? 'animate-shake border-red-500/50' : ''}
                        `}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-[25px] -translate-y-1/2 p-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                        disabled={!password}
                    >
                        <ArrowRight size={16} />
                    </button>

                    <div className="text-center mt-4 text-xs opacity-50 font-light">
                        Hint: Type something and press enter
                    </div>
                </form>
            </div>

            {/* User Profile Picture Placeholder */}
            {/* <div className="absolute bottom-12 flex flex-col items-center space-y-2 opacity-80">
                <div className="w-12 h-12 rounded-full bg-gray-300" />
                <span className="text-sm font-medium">User</span>
            </div> */}
        </div>
    );
};

export default LockScreen;
