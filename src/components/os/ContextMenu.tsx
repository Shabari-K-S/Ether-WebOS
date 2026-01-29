import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOSStore } from '../../store/osStore';

export interface ContextMenuItem {
    label?: string;
    action?: () => void;
    disabled?: boolean;
    danger?: boolean;
    separator?: boolean;
}

interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const { theme } = useOSStore();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleScroll = () => onClose();

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('blur', onClose);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('blur', onClose);
        };
    }, [onClose]);

    // Prevent menu from going off-screen
    const style: React.CSSProperties = {
        top: Math.min(y, window.innerHeight - (items.length * 36) - 10), // Approx height
        left: Math.min(x, window.innerWidth - 200), // Width of menu
    };

    return createPortal(
        <div
            ref={menuRef}
            className={`fixed z-[9999] w-52 rounded-xl border shadow-xl backdrop-blur-xl
        ${theme.isDarkMode
                    ? 'bg-black/60 border-white/10 text-white'
                    : 'bg-white/80 border-black/5 text-black'
                }
        overflow-hidden animate-in fade-in zoom-in-95 duration-100 ease-out p-1.5
      `}
            style={style}
            onContextMenu={(e) => e.preventDefault()}
        >
            {items.map((item, index) => {
                if (item.separator) {
                    return (
                        <div
                            key={index}
                            className={`h-px my-1.5 mx-1 ${theme.isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}
                        />
                    );
                }

                return (
                    <button
                        key={index}
                        onClick={() => {
                            if (!item.disabled && item.action) {
                                item.action();
                                onClose();
                            }
                        }}
                        disabled={item.disabled}
                        className={`
              w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              flex items-center justify-between
              ${item.disabled
                                ? 'opacity-50 cursor-not-allowed'
                                : theme.isDarkMode
                                    ? 'hover:bg-blue-500/80 hover:text-white active:bg-blue-600'
                                    : 'hover:bg-blue-500 hover:text-white active:bg-blue-600'
                            }
              ${item.danger && !item.disabled ? 'text-red-400 hover:bg-red-500/10 hover:text-red-500' : ''}
            `}
                    >
                        {item.label}
                    </button>
                );
            })}
        </div>,
        document.body
    );
};

export default ContextMenu;
