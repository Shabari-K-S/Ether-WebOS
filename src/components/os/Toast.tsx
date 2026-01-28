import React, { useState } from 'react';
import { useOSStore } from '../../store/osStore';
import { X, Info, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

const ToastContainer: React.FC = () => {
    const { notifications, removeNotification } = useOSStore();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-20 right-4 z-[100] flex flex-col space-y-3 pointer-events-none">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className="pointer-events-auto transform transition-all duration-300 animate-slide-in"
                >
                    <ToastItem notification={notification} onClose={() => removeNotification(notification.id)} />
                </div>
            ))}
        </div>
    );
};

interface ToastItemProps {
    notification: any;
    onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ notification, onClose }) => {
    const { theme } = useOSStore();
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300);
    };

    const getIcon = () => {
        switch (notification.type) {
            case 'success': return <CheckCircle size={20} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={20} className="text-orange-500" />;
            case 'error': return <AlertOctagon size={20} className="text-red-500" />;
            default: return <Info size={20} className="text-blue-500" />;
        }
    };

    return (
        <div className={`
            w-80 p-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/10
            flex items-start gap-3 relative overflow-hidden
            ${theme.isDarkMode ? 'bg-black/80 text-white' : 'bg-white/90 text-black'}
            ${isExiting ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}
            transition-all duration-300
        `}>
            <div className="mt-0.5 shrink-0">{getIcon()}</div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm leading-tight">{notification.title}</h4>
                <p className="text-xs opacity-80 mt-1 leading-relaxed">{notification.message}</p>
            </div>
            <button
                onClick={handleClose}
                className="shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
            >
                <X size={14} />
            </button>
            <div className={`absolute bottom-0 left-0 h-0.5 bg-current opacity-20 w-full animate-progress-bar origin-left`} />
        </div>
    );
};

export default ToastContainer;
