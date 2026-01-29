import React, { useState, useEffect } from 'react';
import { useOSStore } from '../../store/osStore';

const BOOT_LOGS = [
    "[  OK  ] Started Monitoring of LVM2 mirrors, snapshots etc. using dmeventd or progress polling.",
    "[  OK  ] Reached target Local File Systems (Pre).",
    "[  OK  ] Reached target Local File Systems.",
    "[  OK  ] Reached target Path Units.",
    "[  OK  ] Reached target Basic System.",
    "Starting Network Service...",
    "Starting Login Service...",
    "[  OK  ] Started Network Service.",
    "[  OK  ] Started Login Service.",
    "Starting Ether-OS Display Manager...",
    "[  OK  ] Started Ether-OS Display Manager.",
    "[  OK  ] Reached target Graphical Interface.",
];

const SHUTDOWN_LOGS = [
    "Stopping Ether-OS Display Manager...",
    "[  OK  ] Stopped Ether-OS Display Manager.",
    "Stopping Login Service...",
    "[  OK  ] Stopped Login Service.",
    "Stopping Network Service...",
    "[  OK  ] Stopped Network Service.",
    "Sending SIGTERM to remaining processes...",
    "Sending SIGKILL to remaining processes...",
    "Unmounting file systems...",
    "[  OK  ] Unmounted /home.",
    "[  OK  ] Unmounted /.",
    "Reached target Power Off.",
    "Powering off.",
];

const BootSequence: React.FC = () => {
    const {
        isRestarting, isShuttingDown, isPoweredOff,
        setIsRestarting, setIsShuttingDown, setIsPoweredOff, setLocked
    } = useOSStore();
    const [logs, setLogs] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPowerDown, setIsPowerDown] = useState(false);

    const activeLogs = isShuttingDown ? SHUTDOWN_LOGS : BOOT_LOGS;

    useEffect(() => {
        if (!isRestarting && !isShuttingDown) {
            setLogs([]);
            setCurrentIndex(0);
            setIsPowerDown(false);
            return;
        }

        if (currentIndex < activeLogs.length) {
            const timer = setTimeout(() => {
                setLogs(prev => [...prev, activeLogs[currentIndex]]);
                setCurrentIndex(prev => prev + 1);
            }, Math.random() * 200 + 50);
            return () => clearTimeout(timer);
        } else {
            // Sequence complete
            const timer = setTimeout(() => {
                if (isRestarting) {
                    setIsRestarting(false);
                    setLocked(true);
                    setIsPoweredOff(false);
                } else if (isShuttingDown) {
                    setIsPowerDown(true);
                    // Attempt to close, but won't work in most browsers unless opened via script
                    window.close();
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, isRestarting, isShuttingDown, setIsRestarting, setLocked, setIsPoweredOff]);

    const handlePowerOn = () => {
        setIsShuttingDown(false);
        setIsPoweredOff(false);
        setIsRestarting(true);
    };

    if (!isRestarting && !isShuttingDown && !isPoweredOff) return null;

    if (isPowerDown || (isPoweredOff && !isRestarting)) {
        return (
            <div className="fixed inset-0 z-[20000] bg-black flex flex-col items-center justify-center text-zinc-500 font-mono text-center p-8">
                <div className="space-y-6 animate-pulse">
                    <p className="text-xl">It is now safe to turn off your computer.</p>
                    <div
                        className="group cursor-pointer flex flex-col items-center gap-2"
                        onClick={handlePowerOn}
                    >
                        <div className="w-16 h-16 rounded-full border-2 border-zinc-700 flex items-center justify-center group-hover:border-zinc-400 transition-colors">
                            <div className="w-8 h-8 rounded-full border-t-2 border-zinc-500 group-hover:border-zinc-300 transform rotate-45" />
                        </div>
                        <p className="text-sm opacity-50 underline group-hover:opacity-100">
                            Power On
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[20000] bg-black text-white font-mono p-4 overflow-hidden flex flex-col justify-end">
            <div className="space-y-1">
                {logs.map((log, i) => (
                    <div key={i} className="text-sm">
                        <span className={log.includes('OK') ? 'text-green-500' : ''}>
                            {log}
                        </span>
                    </div>
                ))}
                <div className="h-4 w-2 bg-white animate-pulse inline-block" />
            </div>
        </div>
    );
};

export default BootSequence;
