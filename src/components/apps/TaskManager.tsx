import React, { useState, useEffect } from 'react';
import { useOSStore } from '../../store/osStore';
import { X, Cpu, HardDrive } from 'lucide-react';
import { APP_METADATA } from '../../apps.config';

interface AppProps {
    windowId: string;
}

const TaskManager: React.FC<AppProps> = () => {
    const { windows, closeWindow, theme } = useOSStore();
    const [cpuUsage, setCpuUsage] = useState<number>(10);
    const [memUsage, setMemUsage] = useState<number>(20);

    useEffect(() => {
        // Mock system stats fluctuation
        const interval = setInterval(() => {
            setCpuUsage(prev => Math.min(100, Math.max(5, prev + (Math.random() * 20 - 10))));
            setMemUsage(prev => Math.min(100, Math.max(15, prev + (Math.random() * 10 - 5))));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`flex flex-col h-full ${theme.isDarkMode ? 'text-white' : 'text-black'} `}>

            {/* Stats Header */}
            <div className="grid grid-cols-2 gap-4 p-4 border-b border-white/10 flex-shrink-0">
                <div className={`
          p-3 rounded-xl flex items-center space-x-3
          ${theme.isDarkMode ? 'bg-white/10' : 'bg-black/5'}
`}>
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                        <Cpu size={20} />
                    </div>
                    <div>
                        <div className="text-xs opacity-50 uppercase font-semibold">CPU Loading</div>
                        <div className="text-xl font-bold">{Math.round(cpuUsage)}%</div>
                    </div>
                    {/* Simple Bar */}
                    <div className="flex-1 h-1.5 ml-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-500 ease-out"
                            style={{ width: `${cpuUsage}%` }}
                        />
                    </div>
                </div>

                <div className={`
          p-3 rounded-xl flex items-center space-x-3
          ${theme.isDarkMode ? 'bg-white/10' : 'bg-black/5'}
`}>
                    <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                        <HardDrive size={20} />
                    </div>
                    <div>
                        <div className="text-xs opacity-50 uppercase font-semibold">Memory</div>
                        <div className="text-xl font-bold">{Math.round(memUsage)}%</div>
                    </div>
                    {/* Simple Bar */}
                    <div className="flex-1 h-1.5 ml-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-purple-500 transition-all duration-500 ease-out"
                            style={{ width: `${memUsage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Process List */}
            <div className="flex-1 overflow-y-auto p-2">
                <table className="w-full text-left text-sm">
                    <thead className="text-xs opacity-50 uppercase border-b border-white/10">
                        <tr>
                            <th className="p-2 font-medium">App Name</th>
                            <th className="p-2 font-medium">ID</th>
                            <th className="p-2 font-medium">Status</th>
                            <th className="p-2 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {windows.map((win) => (
                            <tr key={win.id} className="group hover:bg-white/5 transition-colors">
                                <td className="p-2 flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center overflow-hidden">
                                        {/* We need to reverse lookup the icon or pass it in window state if strictly needed, 
                          but typically we can look it up in APPS via win.appId */}
                                        <img
                                            src={typeof APP_METADATA[win.appId]?.icon === 'string' ? APP_METADATA[win.appId].icon as string : ''}
                                            className="w-4 h-4 object-contain"
                                            alt=""
                                        />
                                    </div>
                                    <span className="font-medium">{APP_METADATA[win.appId]?.name || win.title || 'Unknown'}</span>
                                </td>
                                <td className="p-2 opacity-50 font-mono text-xs">{win.id.slice(0, 8)}...</td>
                                <td className="p-2">
                                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-green-500/20 text-green-400">
                                        Running
                                    </span>
                                </td>
                                <td className="p-2 text-right">
                                    <button
                                        onClick={() => closeWindow(win.id)}
                                        className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                                        title="End Task"
                                    >
                                        <X size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {windows.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center opacity-40">
                                    No active processes
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Status Bar */}
            <div className="p-2 text-xs text-center opacity-30 border-t border-white/10">
                System Uptime: {Math.floor(performance.now() / 60000)}m
            </div>

        </div>
    );
};

export default TaskManager;
